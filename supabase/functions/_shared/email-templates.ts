export const getBaseEmailStyle = () => `
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  color: #1a1a1a;
`;

export const getHeadingStyle = () => `
  color: #1a1a1a;
  font-size: 32px;
  margin: 32px 0 16px 0;
  font-weight: 600;
`;

export const getPriceStyle = () => `
  color: #1a1a1a;
  font-size: 16px;
  margin: 16px 0;
`;

export const getButtonStyle = () => `
  display: inline-block;
  background-color: #00337F;
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 4px;
  margin: 24px 0;
  font-weight: 500;
`;

export const getLogoContainerStyle = () => `
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const getLogoStyle = () => `
  width: 32px;
  height: 32px;
`;

export const getBrandTextStyle = () => `
  font-family: ui-serif, Georgia, Cambria, Times New Roman, Times, serif;
  font-size: 20px;
  color: #1a1a1a;
`;

export const getImageStyle = () => `
  width: 100%;
  max-width: 400px;
  height: auto;
  margin: 24px 0;
  background-color: #f3f4f6;
`;

export const getAuctionTitleStyle = () => `
  font-size: 24px;
  font-weight: 600;
  margin: 16px 0 8px 0;
  color: #1a1a1a;
`;

export const getPaymentConfirmationTemplate = (title: string, price: number, imageUrl?: string) => `
  <div style="${getBaseEmailStyle()}">
    <div style="${getLogoContainerStyle()}">
      <img src="https://dsrjyryrxfruexcwbxea.supabase.co/storage/v1/object/public/artist-avatars/vis-logo.png" 
           alt="Vienna International School" 
           style="${getLogoStyle()}" />
      <span style="${getBrandTextStyle()}">VIS Auction</span>
    </div>
    
    <h1 style="${getHeadingStyle()}">Congratulations!</h1>
    <p>You've won the auction for "${title}"</p>
    
    ${imageUrl ? `<img src="${imageUrl}" alt="${title}" style="${getImageStyle()}" />` : ''}
    
    <h2 style="${getAuctionTitleStyle()}">${title}</h2>
    <p style="${getPriceStyle()}">Final Price: €${price.toLocaleString()}</p>
    
    <p>Thank you for your payment. Our team will be in touch shortly with details about your artwork delivery.</p>
  </div>
`;

export const getAuctionWinTemplate = (title: string, price: number, auctionUrl?: string, imageUrl?: string) => `
  <div style="${getBaseEmailStyle()}">
    <div style="${getLogoContainerStyle()}">
      <img src="https://dsrjyryrxfruexcwbxea.supabase.co/storage/v1/object/public/artist-avatars/vis-logo.png" 
           alt="Vienna International School" 
           style="${getLogoStyle()}" />
      <span style="${getBrandTextStyle()}">VIS Auction</span>
    </div>
    
    <h1 style="${getHeadingStyle()}">Congratulations!</h1>
    <p>You've won the auction for "${title}"</p>
    
    ${imageUrl ? `<img src="${imageUrl}" alt="${title}" style="${getImageStyle()}" />` : ''}
    
    <h2 style="${getAuctionTitleStyle()}">${title}</h2>
    <p style="${getPriceStyle()}">Final Price: €${price.toLocaleString()}</p>
    
    <p>Please complete your payment within 48 hours to secure your win.</p>
    ${auctionUrl ? `
      <a href="${auctionUrl}" style="${getButtonStyle()}">
        Complete Payment
      </a>
    ` : ''}
  </div>
`;

export const getPaymentFailureTemplate = (title: string, price: number, auctionUrl?: string, imageUrl?: string) => `
  <div style="${getBaseEmailStyle()}">
    <div style="${getLogoContainerStyle()}">
      <img src="https://dsrjyryrxfruexcwbxea.supabase.co/storage/v1/object/public/artist-avatars/vis-logo.png" 
           alt="Vienna International School" 
           style="${getLogoStyle()}" />
      <span style="${getBrandTextStyle()}">VIS Auction</span>
    </div>
    
    <h1 style="${getHeadingStyle()}">Payment Action Required</h1>
    <p>We were unable to process your payment for "${title}".</p>
    
    ${imageUrl ? `<img src="${imageUrl}" alt="${title}" style="${getImageStyle()}" />` : ''}
    
    <h2 style="${getAuctionTitleStyle()}">${title}</h2>
    <p style="${getPriceStyle()}">Amount Due: €${price.toLocaleString()}</p>
    
    <p>Please complete your payment within 48 hours to secure your win.</p>
    ${auctionUrl ? `
      <a href="${auctionUrl}" style="${getButtonStyle()}">
        Complete Payment
      </a>
    ` : ''}
  </div>
`;

export const getAbandonedWinTemplate = (
  title: string, 
  price: number, 
  isNewWinner: boolean, 
  auctionUrl?: string,
  imageUrl?: string
) => `
  <div style="${getBaseEmailStyle()}">
    <div style="${getLogoContainerStyle()}">
      <img src="https://dsrjyryrxfruexcwbxea.supabase.co/storage/v1/object/public/artist-avatars/vis-logo.png" 
           alt="Vienna International School" 
           style="${getLogoStyle()}" />
      <span style="${getBrandTextStyle()}">VIS Auction</span>
    </div>
    
    ${isNewWinner ? `
      <h1 style="${getHeadingStyle()}">Congratulations!</h1>
      <p>The previous winner didn't complete their payment for "${title}". You're now the winner!</p>
      
      ${imageUrl ? `<img src="${imageUrl}" alt="${title}" style="${getImageStyle()}" />` : ''}
      
      <h2 style="${getAuctionTitleStyle()}">${title}</h2>
      <p style="${getPriceStyle()}">Final Price: €${price.toLocaleString()}</p>
      
      <p>Please complete your payment within 48 hours to claim your artwork.</p>
      ${auctionUrl ? `
        <a href="${auctionUrl}" style="${getButtonStyle()}">
          Complete Payment
        </a>
      ` : ''}
    ` : `
      <h1 style="${getHeadingStyle()}">Auction Win Expired</h1>
      <p>Your win for "${title}" has expired due to non-payment within 48 hours.</p>
      
      ${imageUrl ? `<img src="${imageUrl}" alt="${title}" style="${getImageStyle()}" />` : ''}
      
      <h2 style="${getAuctionTitleStyle()}">${title}</h2>
      <p style="${getPriceStyle()}">Final Price: €${price.toLocaleString()}</p>
      
      <p>The artwork has been awarded to the next highest bidder.</p>
    `}
  </div>
`;