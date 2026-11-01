import { KeyboardEvent, ReactNode, useEffect, useId, useRef, useState } from 'react';
import { CheckIcon } from '../icons';

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  // Set on every item to make a single-choice menu (menuitemradio).
  checked?: boolean;
}

interface MenuProps {
  // Visible content of the trigger button.
  trigger: ReactNode;
  // Accessible name when the trigger has no text.
  triggerLabel?: string;
  triggerVariant?: 'ghost' | 'icon';
  title?: string;
  items: MenuItem[];
  align?: 'start' | 'end';
  disabled?: boolean;
}

const MENU_HEIGHT_GUESS = 160;

// WAI-ARIA menu button: Enter, Space, or ArrowDown opens and focuses the first item,
// arrows move, Escape closes and returns focus, a click outside closes.
export default function Menu({ trigger, triggerLabel, triggerVariant = 'ghost', title, items, align = 'start', disabled }: MenuProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const radio = items.some((item) => item.checked !== undefined);

  const enabled = () => itemRefs.current.filter((el): el is HTMLButtonElement => !!el && !el.disabled);

  useEffect(() => {
    if (!open) return;
    const checked = items.findIndex((item) => item.checked);
    (itemRefs.current[checked] && !itemRefs.current[checked]?.disabled ? itemRefs.current[checked] : enabled()[0])?.focus();
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
    // Focus only when the menu opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const show = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    setAbove(!!rect && rect.bottom + MENU_HEIGHT_GUESS > window.innerHeight);
    setOpen(true);
  };

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const onMenuKeyDown = (e: KeyboardEvent) => {
    const list = enabled();
    const index = list.indexOf(document.activeElement as HTMLButtonElement);
    const move = (next: number) => {
      e.preventDefault();
      list[(next + list.length) % list.length]?.focus();
    };
    if (e.key === 'ArrowDown') move(index + 1);
    else if (e.key === 'ArrowUp') move(index - 1);
    else if (e.key === 'Home') move(0);
    else if (e.key === 'End') move(list.length - 1);
    else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (e.key === 'Tab') close(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        className="action"
        data-variant={triggerVariant}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `${id}-menu` : undefined}
        aria-label={triggerLabel}
        title={title}
        disabled={disabled}
        onClick={() => (open ? close(false) : show())}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault();
            show();
          }
        }}
      >
        {trigger}
      </button>
      {open && (
        <div
          id={`${id}-menu`}
          role="menu"
          aria-label={triggerLabel}
          onKeyDown={onMenuKeyDown}
          className={`absolute z-30 min-w-[184px] rounded-mid border border-border bg-surface p-1 shadow-pop animate-menu-in ${
            align === 'end' ? 'right-0' : 'left-0'
          } ${above ? 'bottom-full mb-1' : 'top-full mt-1'}`}
        >
          {items.map((item, i) => (
            <button
              key={item.label}
              ref={(el) => { itemRefs.current[i] = el; }}
              type="button"
              role={radio ? 'menuitemradio' : 'menuitem'}
              aria-checked={radio ? !!item.checked : undefined}
              tabIndex={-1}
              disabled={item.disabled}
              className="menu-item"
              onClick={() => {
                item.onSelect();
                close();
              }}
            >
              <span className="flex w-4 flex-none justify-center text-muted">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.checked && <CheckIcon className="h-4 w-4 text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
