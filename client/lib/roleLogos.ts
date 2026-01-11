// Role logo URLs from Firebase Storage
// You can upload these images to Firebase Storage and use the URLs here

export interface RoleLogo {
  label: string;
  url: string;
  color: string;
}

export const getRoleLogos = (): Record<string, RoleLogo> => {
  return {
    founder: {
      label: "Founder",
      url: "https://firebasestorage.googleapis.com/v0/b/keysystem-d0b86-8df89.firebasestorage.app/o/role-logos%2Ffounder.png?alt=media",
      color: "bg-purple-500/20 text-purple-400",
    },
    admin: {
      label: "Admin",
      url: "https://firebasestorage.googleapis.com/v0/b/keysystem-d0b86-8df89.firebasestorage.app/o/role-logos%2Fadmin.png?alt=media",
      color: "bg-blue-500/20 text-blue-400",
    },
    support: {
      label: "Support",
      url: "https://firebasestorage.googleapis.com/v0/b/keysystem-d0b86-8df89.firebasestorage.app/o/role-logos%2Fsupport.png?alt=media",
      color: "bg-amber-500/20 text-amber-400",
    },
    member: {
      label: "User",
      url: "https://firebasestorage.googleapis.com/v0/b/keysystem-d0b86-8df89.firebasestorage.app/o/role-logos%2Fuser.png?alt=media",
      color: "bg-gray-500/20 text-gray-400",
    },
    default: {
      label: "User",
      url: "https://firebasestorage.googleapis.com/v0/b/keysystem-d0b86-8df89.firebasestorage.app/o/role-logos%2Fuser.png?alt=media",
      color: "bg-gray-500/20 text-gray-400",
    },
  };
};

export const getRoleLogo = (role: string): RoleLogo => {
  const logos = getRoleLogos();
  return logos[role] || logos.default;
};
