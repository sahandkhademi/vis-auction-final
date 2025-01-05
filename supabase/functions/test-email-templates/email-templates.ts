import { getBaseEmailStyle, getHeadingStyle, getPriceStyle, getButtonStyle, getFooterStyle, getTableStyle, getTdStyle } from './email-styles.ts';

export type SampleArtwork = {
  title: string;
  artist: string;
  current_price: number;
  image_url: string;
};

export const getEmailTemplates = (sampleArtwork: SampleArtwork) => [
  {
    subject: "[Test] Outbid Notification",
    html: `
      <div style="${getBaseEmailStyle()}">
        <h1 style="${getHeadingStyle()}">New Bid Alert</h1>
        <p>Someone has placed a higher bid on "${sampleArtwork.title}".</p>
        <p style="${getPriceStyle()}">New Highest Bid: €1,200</p>
        <p>Don't miss out - place a new bid now to stay in the running!</p>
        <a href="#" style="${getButtonStyle()}">View Auction</a>
        <div style="${getFooterStyle()}">
          <small>This is a test email from VIS Auction.</small>
        </div>
      </div>
    `
  },
  {
    subject: "[Test] Auction Ending Soon",
    html: `
      <div style="${getBaseEmailStyle()}">
        <h1 style="${getHeadingStyle()}">Time is Running Out!</h1>
        <p>The auction for "${sampleArtwork.title}" is ending soon.</p>
        <p style="${getPriceStyle()}">Current Price: €${sampleArtwork.current_price.toLocaleString()}</p>
        <p>Don't miss your chance to win this exceptional piece!</p>
        <a href="#" style="${getButtonStyle()}">Place Your Bid Now</a>
        <div style="${getFooterStyle()}">
          <small>This is a test email from VIS Auction.</small>
        </div>
      </div>
    `
  },
  {
    subject: "[Test] Auction Won",
    html: `
      <div style="${getBaseEmailStyle()}">
        <h1 style="${getHeadingStyle()}">🎉 You're the Winner!</h1>
        <p>Congratulations! You've won the auction for "${sampleArtwork.title}".</p>
        <p style="${getPriceStyle()}">Winning Bid: €${sampleArtwork.current_price.toLocaleString()}</p>
        <p>Please complete your payment to claim your artwork.</p>
        <a href="#" style="${getButtonStyle()}">Complete Payment</a>
        <div style="${getFooterStyle()}">
          <small>This is a test email from VIS Auction.</small>
        </div>
      </div>
    `
  },
  {
    subject: "[Test] Payment Confirmation",
    html: `
      <div style="${getBaseEmailStyle()}">
        <h1 style="${getHeadingStyle()}">🎉 Payment Confirmed!</h1>
        <p>Thank you for your payment. Here's your purchase confirmation for "${sampleArtwork.title}".</p>
        <table style="${getTableStyle()}">
          <tr>
            <td style="${getTdStyle()}">Artwork</td>
            <td style="${getTdStyle()}">${sampleArtwork.title}</td>
          </tr>
          <tr>
            <td style="${getTdStyle()}">Artist</td>
            <td style="${getTdStyle()}">${sampleArtwork.artist}</td>
          </tr>
          <tr>
            <td style="${getTdStyle()}">Amount Paid</td>
            <td style="${getTdStyle()}" style="${getPriceStyle()}">€${sampleArtwork.current_price.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="${getTdStyle()}">Date</td>
            <td style="${getTdStyle()}">${new Date().toLocaleDateString()}</td>
          </tr>
        </table>
        <div style="${getFooterStyle()}">
          <small>This is a test email from VIS Auction. Please keep this email for your records.</small>
        </div>
      </div>
    `
  }
];