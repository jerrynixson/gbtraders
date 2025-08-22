import { MapPin, MessageCircle, Phone, Globe, Facebook, Twitter, Instagram, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
  // User fallback data
  userFallback?: {
    firstName?: string
    lastName?: string
    email?: string
    emailVerified?: boolean
    role?: string
  }
  dealerUid?: string
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
  socialMedia,
  userFallback,
  dealerUid
}: DealerInformationProps) {
  // Check if we should show user fallback
  const shouldShowUserFallback = 
    (!name || name.includes("not available")) && 
    userFallback && 
    (userFallback.firstName || userFallback.lastName);

  const displayName = shouldShowUserFallback 
    ? `${userFallback.firstName || ''} ${userFallback.lastName || ''}`.trim()
    : name;

  const displayEmail = shouldShowUserFallback ? userFallback.email : email;
  const displayDescription = shouldShowUserFallback 
    ? `${userFallback.role === 'dealer' ? 'Dealer' : 'Private Seller'} • ${userFallback.emailVerified ? 'Verified' : 'Unverified'} Account`
    : description;

  return (
    <div className="border border-border rounded-md overflow-hidden mb-8">
      {/* Only make it a link if we have a dealerUid and it's not a user fallback */}
      {dealerUid && !shouldShowUserFallback ? (
        <Link 
          href={`/categories/dealers/${dealerUid}`}
          className="block hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="p-4 cursor-pointer">
            {coverImage && (
              <div className="w-full h-[120px] rounded-md overflow-hidden mb-4 relative">
                <Image 
                  src={coverImage}
                  alt={`${displayName} banner`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex items-start gap-4">
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors">{displayName}</h3>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
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
                      <span className="hover:text-primary">{phoneNumber}</span>
                    )}
                  </div>
                )}
                {displayEmail && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MessageCircle className="w-4 h-4" />
                    <span className="hover:text-primary">{displayEmail}</span>
                  </div>
                )}
                {website && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Globe className="w-4 h-4" />
                    <span className="hover:text-primary">{website}</span>
                  </div>
                )}
              </div>
            </div>
            
            {displayDescription && (
              <div className="mt-4 text-sm text-muted-foreground">
                <p>{displayDescription}</p>
              </div>
            )}
          </div>
        </Link>
      ) : (
        <div className="p-4">
          {coverImage && !shouldShowUserFallback && (
            <div className="w-full h-[120px] rounded-md overflow-hidden mb-4 relative">
              <Image 
                src={coverImage}
                alt={`${displayName} banner`}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex items-start gap-4">
            <div className="flex-grow">
              <h3 className="text-lg font-semibold">{displayName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                <span>{location}</span>
              </div>
              {phoneNumber && !shouldShowUserFallback && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Phone className="w-4 h-4" />
                  {phoneNumber.includes("not available") || phoneNumber.includes("Contact information") ? (
                    <span className="text-muted-foreground">{phoneNumber}</span>
                  ) : (
                    <a href={`tel:${phoneNumber}`} className="hover:text-primary">{phoneNumber}</a>
                  )}
                </div>
              )}
              {displayEmail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MessageCircle className="w-4 h-4" />
                  <a href={`mailto:${displayEmail}`} className="hover:text-primary">{displayEmail}</a>
                </div>
              )}
              {website && !shouldShowUserFallback && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Globe className="w-4 h-4" />
                  <a href={website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{website}</a>
                </div>
              )}
            </div>
          </div>
          
          {displayDescription && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p>{displayDescription}</p>
            </div>
          )}
        </div>
      )}

      {/* Social media links - always outside the clickable area to prevent conflicts */}
      {socialMedia && Object.keys(socialMedia).length > 0 && !shouldShowUserFallback && (
        <div className="px-4 pb-4 flex items-center gap-4">
          {socialMedia.facebook && (
            <a 
              href={socialMedia.facebook} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-primary transition-colors" 
              title="Visit our Facebook page" 
              aria-label="Facebook"
              onClick={(e) => e.stopPropagation()}
            >
              <Facebook className="w-5 h-5" />
            </a>
          )}
          {socialMedia.twitter && (
            <a 
              href={socialMedia.twitter} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-primary transition-colors" 
              title="Visit our Twitter page" 
              aria-label="Twitter"
              onClick={(e) => e.stopPropagation()}
            >
              <Twitter className="w-5 h-5" />
            </a>
          )}
          {socialMedia.instagram && (
            <a 
              href={socialMedia.instagram} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-muted-foreground hover:text-primary transition-colors" 
              title="Visit our Instagram page" 
              aria-label="Instagram"
              onClick={(e) => e.stopPropagation()}
            >
              <Instagram className="w-5 h-5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
