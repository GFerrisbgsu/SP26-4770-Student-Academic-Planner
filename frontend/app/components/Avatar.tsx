import { useMemo, useState } from 'react';

interface AvatarProps {
  firstName: string;
  lastName: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Avatar component that displays a profile image or generates initials
 * Uses a deterministic color based on the user's name for consistency
 */
export function Avatar({ firstName, lastName, imageUrl, size = 'md', className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  // Generate initials
  const initials = useMemo(() => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
    return firstInitial + lastInitial;
  }, [firstName, lastName]);

  // Generate a consistent color based on the user's name
  const avatarColor = useMemo(() => {
    const fullName = `${firstName}${lastName}`.toLowerCase();
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      const char = fullName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Color palette (professional, accessible colors)
    const colors = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600',
      'from-orange-400 to-orange-600',
      'from-red-400 to-red-600',
      'from-cyan-400 to-cyan-600',
      'from-emerald-400 to-emerald-600',
    ];
    
    return colors[Math.abs(hash) % colors.length];
  }, [firstName, lastName]);

  // Size configurations
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-32 h-32 text-3xl',
  };

  const sizeClass = sizeClasses[size];

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={`${firstName} ${lastName}`}
        className={`${sizeClass} rounded-full object-cover ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div 
      className={`${sizeClass} rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center font-bold text-white shadow-lg ${className}`}
      title={`${firstName} ${lastName}`}
    >
      {initials}
    </div>
  );
}