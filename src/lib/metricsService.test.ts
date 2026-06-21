import { describe, it, expect } from 'vitest';
import { getDashboardMetrics, getTopEmissionCategory, getEcoScore } from './metricsService';
import { Activity, UserProfile } from '../types';

describe('metricsService', () => {
  const mockProfile: UserProfile = {
    userId: '1',
    name: 'Test User',
    city: 'Test City',
    lifestyleType: 'average',
    goalPercent: 10,
    joinDate: new Date().toISOString()
  };

  const getRecentDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  };

  const mockActivities: Activity[] = [
    {
      id: '1',
      date: getRecentDate(1),
      category: 'transport',
      activityType: 'gasoline_car',
      quantity: 10,
      unit: 'km',
      emissionKg: 1.8,
      createdAt: Date.now()
    },
    {
      id: '2',
      date: getRecentDate(2),
      category: 'electricity',
      activityType: 'grid',
      quantity: 10,
      unit: 'kWh',
      emissionKg: 4.5,
      createdAt: Date.now()
    }
  ];

  it('calculates dashboard metrics correctly', () => {
    const metrics = getDashboardMetrics(mockActivities, mockProfile);
    expect(metrics.totalEmissions).toBeCloseTo(6.3);
    expect(metrics.weeklyEmission).toBeCloseTo(6.3);
    expect(metrics.activityCount).toBe(2);
    expect(metrics.categoryEmissions.transport).toBeCloseTo(1.8);
    expect(metrics.categoryEmissions.electricity).toBeCloseTo(4.5);
  });

  it('calculates top emission category', () => {
    const top = getTopEmissionCategory(mockActivities);
    expect(top.category).toBe('electricity');
    expect(top.maxEmission).toBeCloseTo(4.5);
  });

  it('handles empty activities gracefully for top category', () => {
    const top = getTopEmissionCategory([]);
    expect(top.category).toBe('');
    expect(top.maxEmission).toBe(0);
    expect(top.percentage).toBe(0);
  });

  it('calculates eco score correctly', () => {
    const score = getEcoScore(mockActivities, mockProfile);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
