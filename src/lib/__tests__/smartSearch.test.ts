import { describe, it, expect } from 'vitest';
import type { SearchFilters } from '../smartSearch';

describe('smartSearch types', () => {
  it('should have SearchFilters interface', () => {
    const filters: SearchFilters = {
      query: 'test',
      dateRange: {
        start: '2024-01-01',
        end: '2024-12-31'
      },
      filters: {
        status: ['active'],
        minCost: 0,
        maxCost: 100
      }
    };

    expect(filters.query).toBe('test');
    expect(filters.dateRange.start).toBe('2024-01-01');
  });

  it('should validate SearchFilters structure', () => {
    const filters: SearchFilters = {
      query: '',
      dateRange: {
        start: '',
        end: ''
      },
      filters: {
        status: []
      }
    };

    expect(typeof filters.query).toBe('string');
    expect(typeof filters.dateRange).toBe('object');
  });
});

import type { SearchFilters } from '../smartSearch';

describe('smartSearch types', () => {
  it('should have SearchFilters interface', () => {
    const filters: SearchFilters = {
      query: 'test',
      dateRange: {
        start: '2024-01-01',
        end: '2024-12-31'
      },
      filters: {
        status: ['active'],
        minCost: 0,
        maxCost: 100
      }
    };

    expect(filters.query).toBe('test');
    expect(filters.dateRange.start).toBe('2024-01-01');
  });

  it('should validate SearchFilters structure', () => {
    const filters: SearchFilters = {
      query: '',
      dateRange: {
        start: '',
        end: ''
      },
      filters: {
        status: []
      }
    };

    expect(typeof filters.query).toBe('string');
    expect(typeof filters.dateRange).toBe('object');
  });
});



