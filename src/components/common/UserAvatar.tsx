import React from 'react';
import { getFileUrl } from '../../utils/fileUpload';

interface UserAvatarProps {
  user: {
    full_name: string;
    avatar_url?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md',
  className = ''
}) => {
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
    '3xl': 'w-24 h-24 text-3xl',
    '4xl': 'w-32 h-32 text-4xl'
  };

  const baseClasses = 'rounded-full flex items-center justify-center font-medium';

  if (user.avatar_url) {
    return (
      <div className={`${sizeClasses[size]} bg-white ${baseClasses} ${className}`}>
        <img
          src={getFileUrl(user.avatar_url)}
          alt={user.full_name}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} bg-blue-600 text-white ${baseClasses} ${className}`}>
      <span>{getInitials(user.full_name)}</span>
    </div>
  );
}; 