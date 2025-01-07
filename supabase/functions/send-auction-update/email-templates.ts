import { EmailContent, AuctionData } from './types.ts';

export const getEmailContent = (
  type: 'outbid' | 'ending_soon' | 'auction_won' | 'payment_confirmation',
  auction: AuctionData,
  newBidAmount?: number,
  auctionUrl?: string
): EmailContent => {
  const baseStyle = `
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #ffffff;
  `;

  const buttonStyle = `
    display: inline-block;
    background-color: #C6A07C;
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 4px;
    margin: 20px 0;
  `;

  const headingStyle = `
    color: #1a1a1a;
    font-size: 24px;
    margin-bottom: 20px;
  `;

  const priceStyle = `
    font-size: 18px;
    color: #C6A07C;
    font-weight: bold;
  `;

  switch (type) {
    case 'outbid':
      return {
        subject: "You've Been Outbid on VIS Auction!",
        html: `
          <div style="${baseStyle}">
            <h1 style="${headingStyle}">New Bid Alert</h1>
            <p>Someone has placed a higher bid on "${auction.title}".</p>
            <p style="${priceStyle}">New Highest Bid: €${newBidAmount?.toLocaleString()}</p>
            <p>Don't miss out - place a new bid now to stay in the running!</p>
            ${auctionUrl ? `
              <a href="${auctionUrl}" style="${buttonStyle}">
                View Auction
              </a>
            ` : ''}
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; color: #666;">
              <small>This email was sent by VIS Auction. You can adjust your notification preferences in your account settings.</small>
            </div>
          </div>
        `
      };

    case 'payment_confirmation':
      return {
        subject: "Payment Confirmation - VIS Auction",
        html: `
          <div style="${baseStyle}">
            <h1 style="${headingStyle}">Payment Confirmed!</h1>
            <p>Thank you for your payment for "${auction.title}".</p>
            <p style="${priceStyle}">Amount Paid: €${auction.current_price?.toLocaleString()}</p>
            <p>Your transaction has been completed successfully. We will be in touch shortly with shipping details.</p>
            ${auctionUrl ? `
              <a href="${auctionUrl}" style="${buttonStyle}">
                View Auction Details
              </a>
            ` : ''}
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; color: #666;">
              <small>This email was sent by VIS Auction. Please keep this email for your records.</small>
            </div>
          </div>
        `
      };

    case 'ending_soon':
      return {
        subject: "Auction Ending Soon!",
        html: `
          <div style="${baseStyle}">
            <h1 style="${headingStyle}">Time is Running Out!</h1>
            <p>The auction for "${auction.title}" is ending soon.</p>
            <p style="${priceStyle}">Current Price: €${auction.current_price?.toLocaleString()}</p>
            <p>Don't miss your chance to win this exceptional piece!</p>
            ${auctionUrl ? `
              <div>
                <a href="${auctionUrl}" style="${buttonStyle}">
                  Place Your Bid Now
                </a>
              </div>
            ` : ''}
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; color: #666;">
              <small>This email was sent by VIS Auction. If you no longer wish to receive these emails, 
              you can adjust your notification preferences in your account settings.</small>
            </div>
          </div>
        `
      };
    case 'auction_won':
      return {
        subject: "Congratulations! You've Won the Auction!",
        html: `
          <div style="${baseStyle}">
            <h1 style="${headingStyle}">🎉 You're the Winner!</h1>
            <p>Congratulations! You've won the auction for "${auction.title}".</p>
            <p style="${priceStyle}">Winning Bid: €${auction.current_price?.toLocaleString()}</p>
            <p>Please complete your payment to claim your artwork.</p>
            ${auctionUrl ? `
              <div>
                <a href="${auctionUrl}" style="${buttonStyle}">
                  Complete Payment
                </a>
              </div>
            ` : ''}
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; color: #666;">
              <small>This email was sent by VIS Auction. If you no longer wish to receive these emails, 
              you can adjust your notification preferences in your account settings.</small>
            </div>
          </div>
        `
      };
  }
};