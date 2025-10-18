interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

class ToastManager {
  private toasts: Map<number, HTMLDivElement> = new Map();
  private nextId = 0;

  show(options: ToastOptions) {
    const id = this.nextId++;
    const toast = this.createToastElement(options);
    document.body.appendChild(toast);
    this.toasts.set(id, toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => {
        this.remove(id);
      }, 300);
    }, options.duration || 3000);
  }

  private createToastElement(options: ToastOptions): HTMLDivElement {
    const toast = document.createElement('div');
    toast.className = `toast toast-${options.variant || 'default'}`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${options.variant === 'destructive' ? '#ef4444' : '#10b981'};
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 400px;
      z-index: 9999;
      animation: slideInRight 0.3s ease-out;
    `;

    const title = document.createElement('div');
    title.style.cssText = 'font-weight: 600; margin-bottom: 4px;';
    title.textContent = options.title;
    toast.appendChild(title);

    if (options.description) {
      const description = document.createElement('div');
      description.style.cssText = 'font-size: 14px; opacity: 0.9;';
      description.textContent = options.description;
      toast.appendChild(description);
    }

    return toast;
  }

  private remove(id: number) {
    const toast = this.toasts.get(id);
    if (toast) {
      toast.remove();
      this.toasts.delete(id);
    }
  }
}

const toastManager = new ToastManager();

export function useToast() {
  return {
    toast: (options: ToastOptions) => toastManager.show(options),
  };
}

export const toast = (options: ToastOptions) => toastManager.show(options);
