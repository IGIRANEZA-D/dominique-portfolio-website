"use client";

import React from 'react';

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
}

export const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ className, title, subtitle, children, ...props }, ref) => (
    <section ref={ref} className={`section-padding ${className || ''}`} {...props}>
      <div className="max-w-6xl mx-auto">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
        {children}
      </div>
    </section>
  )
);

Section.displayName = 'Section';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={`max-w-6xl mx-auto px-4 md:px-6 lg:px-8 ${className || ''}`} {...props}>
      {children}
    </div>
  )
);

Container.displayName = 'Container';
