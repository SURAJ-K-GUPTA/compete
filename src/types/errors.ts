export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class ScrapingError extends APIError {
  constructor(message: string) {
    super(message, 500, 'SCRAPING_ERROR');
    this.name = 'ScrapingError';
  }
} 