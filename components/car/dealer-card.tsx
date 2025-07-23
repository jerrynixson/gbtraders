import Image from 'next/image';
import { Card } from "@/components/ui/card";
import { Building2, Mail, Phone, Globe, MapPin } from "lucide-react";
import Link from 'next/link';

interface DealerCardProps {
  name: string;
  location: string;
  phoneNumber: string;
  description: string;
  email?: string;
  logo?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

export function DealerCard({
  name,
  location,
  phoneNumber,
  description,
  email,
  logo,
  website,
  socialMedia
}: DealerCardProps) {
  return (
    <Card className="p-6 bg-white shadow-sm">
      <div className="flex flex-col space-y-4">
        {/* Dealer Logo and Name */}
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
            {logo ? (
              <Image
                src={logo}
                alt={name}
                fill
                className="object-cover"
              />
            ) : (
              <Building2 className="w-full h-full p-3 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1" />
              {location}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600">{description}</p>

        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            <span>{phoneNumber}</span>
          </div>
          {email && (
            <div className="flex items-center text-sm">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
                {email}
              </a>
            </div>
          )}
          {website && (
            <div className="flex items-center text-sm">
              <Globe className="w-4 h-4 mr-2 text-gray-400" />
              <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {/* Social Media Links */}
        {socialMedia && Object.keys(socialMedia).length > 0 && (
          <div className="flex space-x-4 pt-2">
            {socialMedia.facebook && (
              <Link href={socialMedia.facebook} target="_blank" rel="noopener noreferrer">
                <Image src="/facebook.svg" alt="Facebook" width={20} height={20} />
              </Link>
            )}
            {socialMedia.twitter && (
              <Link href={socialMedia.twitter} target="_blank" rel="noopener noreferrer">
                <Image src="/twitter.svg" alt="Twitter" width={20} height={20} />
              </Link>
            )}
            {socialMedia.instagram && (
              <Link href={socialMedia.instagram} target="_blank" rel="noopener noreferrer">
                <Image src="/instagram.svg" alt="Instagram" width={20} height={20} />
              </Link>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
