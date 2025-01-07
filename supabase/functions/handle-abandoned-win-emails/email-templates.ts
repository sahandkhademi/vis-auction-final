export const getBaseEmailStyle = () => `
  font-family: ui-sans-serif, system-ui, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 32px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
`;

export const getButtonStyle = () => `
  display: inline-block;
  background-color: #C6A07C;
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 0;
  margin: 20px 0;
  font-weight: 500;
`;

export const getHeadingStyle = () => `
  color: #1a1a1a;
  font-size: 24px;
  margin-bottom: 20px;
  font-weight: 500;
`;

export const getPriceStyle = () => `
  font-size: 18px;
  color: #C6A07C;
  font-weight: bold;
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
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  color: #666;
  font-size: 14px;
`;

export const getAbandonedWinTemplate = (title: string, price: number, isNewWinner: boolean, auctionUrl?: string) => `
  <div style="${getBaseEmailStyle()}">
    <div style="${getLogoContainerStyle()}">
      <img src="https://dsrjyryrxfruexcwbxea.supabase.co/storage/v1/object/public/artist-avatars/vis-logo.png" 
           alt="Vienna International School" 
           style="${getLogoStyle()}" />
      <span style="${getBrandTextStyle()}">VIS Auction</span>
    </div>
    ${isNewWinner ? `
      <h1 style="${getHeadingStyle()}">🎉 You're the New Winner!</h1>
      <p>The previous winner didn't complete their payment for "${title}". 
      You're now the winner with your bid of €${price.toLocaleString()}!</p>
      <p>Please complete your payment within 48 hours to claim your artwork.</p>
      ${auctionUrl ? `
        <a href="${auctionUrl}" style="${getButtonStyle()}">
          Complete Payment
        </a>
      ` : ''}
    ` : `
      <h1 style="${getHeadingStyle()}">Auction Win Expired</h1>
      <p>Your win for "${title}" has expired due to non-payment within 48 hours.</p>
      <p>The artwork has been awarded to the next highest bidder.</p>
    `}
    <div style="${getFooterStyle()}">
      <small>This email was sent by VIS Auction. If you no longer wish to receive these emails, 
      you can adjust your notification preferences in your account settings.</small>
    </div>
  </div>
`;