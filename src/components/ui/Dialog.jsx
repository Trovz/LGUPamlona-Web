import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useRef } from 'react';

export default function Dialog({ children, title, subtitle, onClose }) {
    const opener = useRef(document.activeElement);
    return <DialogPrimitive.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 p-3 sm:p-6">
                <DialogPrimitive.Content
                    onCloseAutoFocus={(event) => {
                        event.preventDefault();
                        opener.current?.focus?.();
                    }}
                    onOpenAutoFocus={(event) => {
                        const field = event.currentTarget.querySelector('input:not([type=hidden]), select, textarea');
                        if (field) {
                            event.preventDefault();
                            field.focus();
                        }
                    }}
                    className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-line bg-card p-5 shadow-2xl focus:outline-none sm:p-6">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <DialogPrimitive.Title className="text-xl font-bold">{title}</DialogPrimitive.Title>
                            {subtitle && <DialogPrimitive.Description className="mt-1 text-sm text-muted">{subtitle}</DialogPrimitive.Description>}
                        </div>
                        <DialogPrimitive.Close className="rounded-md px-2 py-1 text-xl leading-none text-muted hover:bg-interactive-hover hover:text-interactive-hover-text" aria-label="Close dialog">×</DialogPrimitive.Close>
                    </div>
                    {children}
                </DialogPrimitive.Content>
            </DialogPrimitive.Overlay>
        </DialogPrimitive.Portal>
    </DialogPrimitive.Root>;
}
