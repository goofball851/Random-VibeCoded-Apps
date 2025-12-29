
export type CardTemplate = 'corporate' | 'casual' | 'cartoony' | 'trendy' | 'minimal' | 'brutalist';

export interface CardData {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  siteName?: string;
  template: CardTemplate;
  accentColor: string;
  secondaryColor: string;
  backgroundColor: string;
  // Design overrides
  fontFamily: 'sans' | 'serif' | 'mono';
  textAlign: 'left' | 'center';
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  imageOpacity: number;
  borderRadius: number;
}

export interface AIUnfurlResult {
  title: string;
  description: string;
  siteName: string;
  imageSuggestionPrompt: string;
}
