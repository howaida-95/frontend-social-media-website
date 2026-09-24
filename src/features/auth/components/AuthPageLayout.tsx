import type { ReactNode } from 'react';
import { Star } from 'lucide-react';

const AVATARS = [
  'https://i.pravatar.cc/64?img=12',
  'https://i.pravatar.cc/64?img=32',
  'https://i.pravatar.cc/64?img=45',
];

type AuthPageLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Shared auth chrome: hero + white card.
 * Form fields/submit stay in the child form component.
 */
export default function AuthPageLayout({
  title,
  description,
  children,
  footer,
}: AuthPageLayoutProps) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center gap-12 px-6 pb-12 pt-24 lg:flex-row lg:items-center lg:gap-16 lg:px-10 lg:pt-16">
      <section className="auth-hero-panel flex-1 lg:max-w-xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex -space-x-2">
            {AVATARS.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="h-8 w-8 rounded-full border-2 border-white object-cover"
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className="h-3.5 w-3.5 fill-(--color-star) text-(--color-star)"
                />
              ))}
            </div>
            <p className="rating-text">Used by 12k+ developers</p>
          </div>
        </div>

        <h1 className="hero-title mb-4 text-[clamp(2.25rem,5vw,3.75rem)]">
          More than just friends truly connect
        </h1>
        <p className="hero-description text-[clamp(1.25rem,2.5vw,1.875rem)]">
          connect with global community on pingup.
        </p>
      </section>

      <section className="auth-card-panel flex w-full justify-center lg:w-auto lg:shrink-0">
        <div className="auth-card">
          <div className="auth-form space-y-6 px-8 pt-8 pb-6">
            <div className="space-y-1 text-center">
              <h2 className="auth-title">{title}</h2>
              <p className="auth-description">{description}</p>
            </div>
            {children}
          </div>

          {footer ? (
            <div className="auth-footer gap-1 px-4 text-sm text-(--color-content-muted)">
              {footer}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
