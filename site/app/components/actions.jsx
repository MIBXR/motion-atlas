import { Star } from 'lucide-react';
import { Button, Combobox, Select, Tooltip } from './ui';
import { usePreferences } from '../state/preferences';
import buttonStyles from '../arc/registry/components/button/button.module.css';
export function IconAction({ label, children, className = '', ...props }) {
  return (
    <Tooltip content={label}>
      <Button
        variant="secondary"
        {...props}
        aria-label={label}
        className={`icon-action ${className}`}
      >
        {children}
      </Button>
    </Tooltip>
  );
}
export function ActionLink({
  children,
  variant = 'secondary',
  className = '',
  ...props
}) {
  return (
    <a
      {...props}
      className={`${buttonStyles.button} ${buttonStyles[variant]} ${buttonStyles.md} action-link ${className}`}
    >
      {children}
    </a>
  );
}
export function Choice({ options, value, onValueChange, ...props }) {
  const empty = options.find(
    (option) => option.value === 'all' || option.value === 'none',
  );
  return options.length >= 12 ? (
    <Combobox
      {...props}
      options={options}
      value={empty && value === empty.value ? '' : value}
      clearable={Boolean(empty)}
      onValueChange={(next) => onValueChange(next || empty?.value || value)}
      emptyMessage="没有匹配的选项"
      placeholder={empty?.label || '搜索或选择'}
    />
  ) : (
    <Select
      {...props}
      value={value}
      options={options}
      onValueChange={onValueChange}
    />
  );
}
export function FavoriteAction({ kind, entry }) {
  const { favorites, toggleFavorite } = usePreferences();
  const selected = favorites[kind].includes(entry.id);
  return (
    <IconAction
      label={`${selected ? '取消收藏' : '收藏'}${entry.title}`}
      aria-pressed={selected}
      onClick={() => toggleFavorite(kind, entry.id)}
    >
      <Star size={17} fill={selected ? 'currentColor' : 'none'} />
    </IconAction>
  );
}
