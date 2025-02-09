export interface EmailData {
  userId: string;
  auctionId: string;
  type: 'outbid' | 'ending_soon' | 'auction_won';
  newBidAmount?: number;
  auctionTitle?: string;
}

export interface EmailContent {
  subject: string;
  html: string;
}

export interface AuctionData {
  title: string;
  current_price: number;
  artist?: string;
}