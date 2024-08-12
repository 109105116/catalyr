import { AvatarProps } from "@radix-ui/react-avatar";
import { FC } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icons } from "@/components/ui/icons";
import Image from "next/image";

interface UserAvatarProps extends AvatarProps {
  image: string | null | undefined;
  name: string | null | undefined;
}

const UserAvatar: FC<UserAvatarProps> = ({ image, name, ...props }) => {
  return (
    <Avatar {...props}>
      {image ? (
        <div className="relative aspect-square h-full w-full">
          <Image
            fill
            sizes="100vw"
            src={image}
            alt="profile picture"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <AvatarFallback>
          <span className="sr-only">{name}</span>
          <Icons.user className="h-4 w-4" />
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
