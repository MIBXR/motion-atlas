import sys
exec((__import__('pathlib').Path(__file__).parent/'measure_rows.py').read_text(encoding='utf8').split('out={row:[]')[0])
data=read(CASE/'film/data/rowStates.json');original={k:np.array(v)for k,v in data['rows'].items()};source=np.load(cache,mmap_mode='r')
kept=['Fl.','Ob.','Cl.','Bsn.','Hn.','Vln. I','Vln. II','Va.','Vc.','Cb.']
out={row:[]for row in templates};actives={row:[]for row in YS};diagnostics={row:[]for row in templates}
for i,frame in enumerate(source):
    f=2*i;t=f/60;back=backgrounds[f].astype(float);diff=np.max(abs(frame.astype(float)-back),2).astype('float32')
    focus=next((e for e in shots['focus']if e['t0']<=t<=e['t1']),None)
    pval=0;sx=1;head=880
    if focus:
        curve=np.array(focus['curve']);pval=float(np.interp(t,curve[:,0],curve[:,1]));sx=1+(focus['maxX']-1)*pval;head=880+290*pval if focus['id']!='focus-cym-hp'else 880
    structural=0
    if 22.2<t<28.1:
        cl=original['Cl.'];y=float(np.interp(t,cl[:,0],cl[:,1]));structural=float(np.clip((y-306)/(242+2*516/9-306),0,1))
    for row,(template,xorig,yoff)in templates.items():
        group=row in groups;basey=float(YS.get(row,groups.get(row,(0,0))[1]));active=False
        if focus and focus['id']=='focus-cym-hp' and pval>.025:
            cy=np.interp(t,original['Cym.'][:,0],original['Cym.'][:,1]);hy=np.interp(t,original['Hp.'][:,0],original['Hp.'][:,1]);vertical=(hy-cy)/96
            y=cy+(basey-490)*vertical;alpha=1 if row in ['Cym.','Hp.']else 0 if group or row=='dyn.'else .08
            cc=1
        else:
            s=sx
            if row in kept and structural:expected=basey+(242+kept.index(row)*516/9-basey)*structural
            elif focus and row in focus['rows']:expected=float(np.interp(t,curve[:,0],curve[:,3+focus['rows'].index(row)]))
            else:expected=490+(basey-490)*sx
            xright=head-720*sx
            left=max(0,round((head+(xorig-880)*sx)-12));right=min(180,round(xright+12)) if not group else min(180,round(head+(65-880)*sx)+10)
            lo=max(0,round(expected-170+yoff*sx)-7);hi=min(670,round(expected-170+yoff*sx+template.shape[0]*sx)+8)
            best=None
            for factor in ([.9,1,1.1]if focus and row in focus['rows']else[1]):
                s=sx*factor;temp=cv2.resize(template,None,fx=s,fy=s,interpolation=cv2.INTER_LINEAR);h,w=temp.shape;region=diff[lo:hi,left:right]
                if region.shape[0]<h or region.shape[1]<w:continue
                corr=cv2.matchTemplate(region,temp,cv2.TM_CCOEFF_NORMED);_,cc,_,(xx,yy)=cv2.minMaxLoc(corr)
                y=lo+yy+170-yoff*s
                score=cc-.006*abs(y-expected)
                if best is None or score>best[0]:best=(score,cc,y,temp,left+xx,lo+yy,s)
            if best is None:y=expected;alpha=0;cc=0
            else:
                _,cc,y,temp,tx,ty,s=best;h,w=temp.shape;patch=frame[ty:ty+h,tx:tx+w].astype(float)
                observed=np.sum((patch-back)*temp[:,:,None],axis=(0,1))/max(float(np.sum(temp*temp)),.01)
                if group:nominal=np.array([129,122,69]if back[1]>150 else[255]*3)-back
                else:
                    mx=head-712*sx;my=round(y-170);marker=diff[max(0,my-round(6*s)):min(670,my+round(7*s)),max(0,round(mx)):min(180,round(mx+3*s))]
                    active=bool(marker.size and np.percentile(marker,80)>max(5,np.max(abs(observed))*.38))
                    if row=='dyn.':active=False
                    nominal=np.array(([24]*3 if active else[136]*3)if back[1]>150 else([255]*3 if np.sum(observed)>0 else[35,0,5]))-back
                alpha=float(np.clip(np.dot(observed,nominal)/max(1,float(nominal@nominal)),0,1))
                if cc<.48 or np.max(abs(observed))<1.6:alpha=0;y=expected
            if focus and focus['id']!='focus-cym-hp' and row not in focus['rows'] and pval>.9:alpha=0
        out[row].append([t,y,alpha]);diagnostics[row].append([t,float(cc)])
        if row in actives:actives[row].append([t,int(active)])
    if i%900==0:print('refine',i,flush=True)
for row,values in out.items():
    a=np.array(values);a[:,1]=np.round(a[:,1]*2)/2;a=np.vstack([a,[122.005,*a[-1,1:]]]);out[row]=simplify(a)
data={'rows':{k:v for k,v in out.items()if k in YS},'groups':{k:v for k,v in out.items()if k in groups},'active':{k:[v for i,v in enumerate(a)if i==0 or v[1]!=a[i-1][1]]for k,a in actives.items()}}
write(CASE/'film/data/rowStates.json',data);write(WORK/'row-refined-diagnostics.json',diagnostics)
print('done',flush=True)
