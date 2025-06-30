// ID generation strategies for test cases

/**
 * Interface for ID generation strategies
 */
export interface IdGenerator {
  generateId(feature: string): string;
}

/**
 * Simple counter-based ID generator
 */
export class SequentialIdGenerator implements IdGenerator {
  private counter: number = 1;

  generateId(feature: string): string {
    const featureId = this.normalizeFeatureName(feature);
    const sequence = String(this.counter++).padStart(3, '0');
    return `TC-${featureId}-${sequence}`;
  }

  private normalizeFeatureName(feature: string): string {
    return feature.toUpperCase().replace(/[-]/g, '_');
  }

  /**
   * Reset counter (useful for testing)
   */
  reset(): void {
    this.counter = 1;
  }
}

/**
 * Timestamp-based ID generator
 */
export class TimestampIdGenerator implements IdGenerator {
  generateId(feature: string): string {
    const featureId = this.normalizeFeatureName(feature);
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits
    return `TC-${featureId}-${timestamp}`;
  }

  private normalizeFeatureName(feature: string): string {
    return feature.toUpperCase().replace(/[-]/g, '_');
  }
}

/**
 * Random-based ID generator
 */
export class RandomIdGenerator implements IdGenerator {
  generateId(feature: string): string {
    const featureId = this.normalizeFeatureName(feature);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TC-${featureId}-${randomNum}`;
  }

  private normalizeFeatureName(feature: string): string {
    return feature.toUpperCase().replace(/[-]/g, '_');
  }
}

// Default generator instance
export const defaultIdGenerator = new SequentialIdGenerator();