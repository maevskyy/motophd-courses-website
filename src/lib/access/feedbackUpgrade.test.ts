import { describe, expect, it } from 'vitest';
import { getFeedbackUpgradeCourseSlugs, type FeedbackUpgradeCandidate } from './feedbackUpgrade';

const purchase = (
  courseSlug: string,
  tier: FeedbackUpgradeCandidate['tier'],
  status: FeedbackUpgradeCandidate['status'] = 'paid'
): FeedbackUpgradeCandidate => ({ courseSlug, status, tier });

describe('getFeedbackUpgradeCourseSlugs', () => {
  it('offers the upgrade for a paid standard tier without feedback', () => {
    expect(getFeedbackUpgradeCourseSlugs([purchase('lean', 'standard')])).toEqual(['lean']);
  });

  it('returns nothing without purchases', () => {
    expect(getFeedbackUpgradeCourseSlugs([])).toEqual([]);
  });

  it('hides the upgrade once feedback is paid, whether bought outright or as an upgrade', () => {
    expect(
      getFeedbackUpgradeCourseSlugs([purchase('lean', 'standard'), purchase('lean', 'feedback')])
    ).toEqual([]);
    expect(
      getFeedbackUpgradeCourseSlugs([
        purchase('lean', 'standard'),
        purchase('lean', 'feedback_upgrade')
      ])
    ).toEqual([]);
    expect(getFeedbackUpgradeCourseSlugs([purchase('lean', 'feedback')])).toEqual([]);
  });

  it('ignores purchases that are not paid', () => {
    expect(getFeedbackUpgradeCourseSlugs([purchase('lean', 'standard', 'pending')])).toEqual([]);
    expect(getFeedbackUpgradeCourseSlugs([purchase('lean', 'standard', 'failed')])).toEqual([]);
    // Незавершённый upgrade не блокирует кнопку: человек может попробовать ещё раз.
    expect(
      getFeedbackUpgradeCourseSlugs([
        purchase('lean', 'standard'),
        purchase('lean', 'feedback_upgrade', 'pending')
      ])
    ).toEqual(['lean']);
  });

  it('decides per course and lists each course once', () => {
    expect(
      getFeedbackUpgradeCourseSlugs([
        purchase('lean', 'standard'),
        purchase('lean', 'standard'),
        purchase('counter-steering', 'standard'),
        purchase('counter-steering', 'feedback_upgrade')
      ])
    ).toEqual(['lean']);
  });

  it('skips purchases whose course could not be resolved', () => {
    expect(getFeedbackUpgradeCourseSlugs([purchase('', 'standard')])).toEqual([]);
  });
});
