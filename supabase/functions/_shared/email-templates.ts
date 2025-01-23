export const getBaseEmailStyle = () => `
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  color: #1a1a1a;
  border: 1px solid #e5e7eb;
`;

export const getHeadingStyle = () => `
  color: #1a1a1a;
  font-size: 24px;
  margin-bottom: 20px;
  font-weight: 600;
`;

export const getPriceStyle = () => `
  color: #00337F;
  font-size: 20px;
  font-weight: 600;
  margin: 16px 0;
`;

export const getButtonStyle = () => `
  display: inline-block;
  background-color: #00337F;
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 0;
  margin: 16px 0;
  font-weight: 500;
`;

export const getLogoContainerStyle = () => `
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;

export const getLogoStyle = () => `
  width: 32px;
  height: 32px;
  margin-right: 12px;
`;

export const getBrandTextStyle = () => `
  font-family: ui-serif, Georgia, Cambria, Times New Roman, Times, serif;
  font-size: 20px;
  color: #1a1a1a;
`;

export const getFooterStyle = () => `
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  color: #666;
  font-size: 14px;
`;

export const getAuctionWinTemplate = (title: string, price: number, auctionUrl?: string) => `
  <div style="${getBaseEmailStyle()}">
    <div style="${getLogoContainerStyle()}">
      <img src="https://dsrjyryrxfruexcwbxea.supabase.co/storage/v1/object/public/artist-avatars/vis-logo.png" 
           alt="Vienna International School" 
           style="${getLogoStyle()}" />
      <span style="${getBrandTextStyle()}">VIS Auction</span>
    </div>
    <h1 style="${getHeadingStyle()}">🎉 Congratulations!</h1>
    <p>You've won the auction for "${title}"!</p>
    <p style="${getPriceStyle()}">Final Price: €${price.toLocaleString()}</p>
    <p>Please complete your payment within 48 hours to secure your win.</p>
    ${auctionUrl ? `
      <a href="${auctionUrl}" style="${getButtonStyle()}">
        Complete Payment
      </a>
    ` : ''}
    <div style="${getFooterStyle()}">
      <small>This is an automated email from VIS Auction.</small>
    </div>
  </div>
`;