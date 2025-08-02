import { MapPin, MessageCircle, Phone, Globe, Facebook, Twitter, Instagram } from "lucide-react"
import Image from "next/image"

interface DealerInformationProps {
  name: string
  location: string
  phoneNumber: string
  description: string
  email?: string
  logo?: string
  coverImage?: string
  website?: string
  socialMedia?: {
    facebook?: string
    twitter?: string
    instagram?: string
  }
}

export function DealerInformation({ 
  name, 
  location,
  phoneNumber, 
  description,
  email,
  logo,
  coverImage,
  website,
  socialMedia
}: DealerInformationProps) {
  return (
    <div className="border border-border rounded-md p-4 mb-8">
      {coverImage && (
        <div className="w-full h-[120px] rounded-md overflow-hidden mb-4 relative">
          <Image 
            src={coverImage}
            alt={`${name} banner`}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="flex items-start gap-4">
        {logo && (
          <div className="w-[80px] h-[80px] rounded-md overflow-hidden flex-shrink-0 relative">
            <Image 
              src={logo}
              alt={`${name} logo`}
              fill
              className="object-contain"
            />
          </div>
        )}
        <div className="flex-grow">
          <h3 className="text-lg font-semibold">{name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          {phoneNumber && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Phone className="w-4 h-4" />
              {phoneNumber.includes("not available") || phoneNumber.includes("Contact information") ? (
                <span className="text-muted-foreground">{phoneNumber}</span>
              ) : (
                <a href={`tel:${phoneNumber}`} className="hover:text-primary">{phoneNumber}</a>
              )}
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MessageCircle className="w-4 h-4" />
              <a href={`mailto:${email}`} className="hover:text-primary">{email}</a>
            </div>
          )}
          {website && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Globe className="w-4 h-4" />
              <a href={website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{website}</a>
            </div>
          )}
        </div>
      </div>
      
      {description && (
        <div className="mt-4 text-sm text-muted-foreground">
          <p>{description}</p>
        </div>
      )}

      {socialMedia && Object.keys(socialMedia).length > 0 && (
        <div className="mt-4 flex items-center gap-4">
          {socialMedia.facebook && (
            <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" title="Visit our Facebook page" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
          )}
          {socialMedia.twitter && (
            <a href={socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" title="Visit our Twitter page" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
          )}
          {socialMedia.instagram && (
            <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" title="Visit our Instagram page" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}