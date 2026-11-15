import React from 'react';

interface GdgUpesLogoProps {
  className?: string;
  showCampusTag?: boolean;
  compact?: boolean;
}

/**
 * Renders the unaltered official Google Developer Groups SVG logo retrieved from
 * gdg.community.dev/gdg-on-campus-university-of-petroleum-and-energy-studies-dehradun-india/
 * paired cleanly with the UPES Dehradun campus attribution label.
 */
export const GdgUpesLogo: React.FC<GdgUpesLogoProps> = ({
  className = '',
  showCampusTag = true,
  compact = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <img
        src="/assets/branding/gdg-logo-dark.svg"
        alt="Google Developer Groups logo"
        referrerPolicy="no-referrer"
        className={compact ? 'h-5 w-auto object-contain' : 'h-7 sm:h-8 w-auto object-contain'}
      />
      {showCampusTag && (
        <span className="hidden sm:inline-block h-4 w-px bg-white/20 shrink-0" aria-hidden="true" />
      )}
      {showCampusTag && (
        <span className="text-xs sm:text-sm font-medium tracking-tight text-slate-200 whitespace-nowrap shrink-0">
          On Campus · UPES
        </span>
      )}
    </div>
  );
};
