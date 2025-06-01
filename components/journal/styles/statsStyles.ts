import { StyleSheet } from 'react-native';

export const createStatsStyles = (theme: any) => StyleSheet.create({
  modernStatsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.background,
  },

  // Compact Detailed Stats Styles
  compactDetailedStatsContainer: {
    minHeight: 600,
    maxHeight: 600,
    backgroundColor: theme.background,
  },

  compactDetailedStatsScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },

  compactStatsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.background,
  },

  compactStatsLoadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },

  compactStatsLoadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: theme.textSecondary,
    fontFamily: 'Inter-Regular',
  },

  compactStatsErrorText: {
    color: theme.error,
    textAlign: 'center',
    padding: 16,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },

  compactDateRangeSelectorCard: {
    backgroundColor: theme.card,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },

  compactDateRangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  compactDateRangeTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginLeft: 6,
  },

  compactDateRangeOptionsRow: {
    flexDirection: 'row',
    gap: 6,
  },

  compactDateRangeOptionButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.borderLight,
  },

  compactDateRangeOptionSelected: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },

  compactDateRangeOptionText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
  },

  compactDateRangeOptionTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },

  compactOverviewStatsCard: {
    backgroundColor: theme.card,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },

  compactSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  compactSectionHeaderText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginLeft: 6,
  },

  compactOverviewStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  compactOverviewStatItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 6,
    padding: 8,
  },

  compactOverviewStatIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },

  compactOverviewStatValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: theme.text,
    marginBottom: 2,
  },

  compactOverviewStatLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
    textAlign: 'center',
  },

  compactActivityHighlightsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },

  compactActivityTypesCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },

  compactSmallSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  compactSmallSectionHeaderText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginLeft: 4,
  },

  compactActivityTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },

  compactActivityTypeIconSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },

  compactActivityTypeInfo: {
    flex: 1,
  },

  compactActivityTypeNameSmall: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: theme.text,
  },

  compactActivityTypeCount: {
    fontSize: 8,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
  },

  compactActivityTypePercentage: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },

  compactMoreText: {
    fontSize: 9,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },

  compactHighlightsCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },

  compactHighlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  compactHighlightIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    backgroundColor: theme.backgroundSecondary,
  },

  compactHighlightContent: {
    flex: 1,
  },

  compactHighlightLabel: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
  },

  compactHighlightValue: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
  },

  compactHighlightSubtext: {
    fontSize: 8,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
  },

  dateRangeSelectorCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.outline + '30',
  },

  dateRangeSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  dateRangeSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },

  dateRangeSelectorIcon: {
    padding: 4,
  },

  dateRangeButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  dateRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.outline + '40',
    alignItems: 'center',
  },

  dateRangeButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },

  dateRangeButtonText: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: '500',
  },

  dateRangeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  enhancedStatsSection: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.outline + '30',
  },

  enhancedStatsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  enhancedStatsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },

  statsTabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.surfaceVariant,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },

  statsTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },

  statsTabActive: {
    backgroundColor: theme.primary,
  },

  statsTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },

  statsTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  statsOverviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },

  statsOverviewCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: theme.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },

  statsOverviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 4,
  },

  statsOverviewLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },

  activityTypeBreakdown: {
    gap: 12,
    marginBottom: 20,
  },

  activityTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceVariant,
    borderRadius: 12,
    padding: 12,
  },

  activityTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  activityTypeInfo: {
    flex: 1,
  },

  activityTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },

  activityTypeCount: {
    fontSize: 12,
    color: theme.textSecondary,
  },

  activityTypePercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.primary,
    marginLeft: 8,
  },

  metadataSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.outline + '30',
  },

  metadataItem: {
    alignItems: 'center',
  },

  metadataLabel: {
    fontSize: 11,
    color: theme.textSecondary,
    marginBottom: 2,
  },

  metadataValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text,
  },

  statsChartsContainer: {
    gap: 16,
  },

  chartCard: {
    backgroundColor: theme.surfaceVariant,
    borderRadius: 12,
    padding: 16,
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
    textAlign: 'center',
  },

  chartPlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.outline + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.outline + '30',
    borderStyle: 'dashed',
  },

  chartPlaceholderText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 8,
  },

  // Analytics Modal Styles
  analyticsModal: {
    flex: 1,
    backgroundColor: theme.surface,
  },

  analyticsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.outline + '30',
  },

  analyticsModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },

  analyticsCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.surfaceVariant,
  },

  analyticsContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  analyticsBasicInfo: {
    marginBottom: 24,
  },

  analyticsActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.surfaceVariant,
    borderRadius: 16,
    marginBottom: 16,
  },

  analyticsActivityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  analyticsActivityInfo: {
    flex: 1,
  },

  analyticsActivityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },

  analyticsActivityType: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },

  analyticsActivityTime: {
    fontSize: 12,
    color: theme.textSecondary,
  },

  analyticsSection: {
    marginBottom: 24,
  },

  analyticsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 16,
  },

  analyticsCard: {
    backgroundColor: theme.surfaceVariant,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.outline + '30',
  },

  analyticsDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.outline + '20',
  },

  analyticsDetailLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    flex: 1,
  },

  analyticsDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
    textAlign: 'right',
  },

  analyticsToolsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },

  analyticsToolTag: {
    backgroundColor: theme.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  analyticsToolText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.primary,
  },

  analyticsWorkloadTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  analyticsWorkloadText: {
    fontSize: 12,
    fontWeight: '600',
  },

  analyticsHabitsList: {
    gap: 8,
    marginTop: 8,
  },

  analyticsHabitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.outline + '20',
  },

  analyticsHabitText: {
    fontSize: 13,
    color: theme.text,
  },

  analyticsRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  analyticsRatingText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginLeft: 4,
  },

  analyticsRecommendationsList: {
    gap: 8,
    marginTop: 8,
  },

  analyticsRecommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  analyticsRecommendationText: {
    fontSize: 13,
    color: theme.text,
    flex: 1,
    lineHeight: 18,
  },

  analyticsLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  analyticsLoadingText: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 16,
  },

  analyticsErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },

  analyticsErrorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },

  analyticsErrorText: {
    fontSize: 16,
    color: theme.error,
    textAlign: 'center',
    marginVertical: 16,
  },

  analyticsRetryButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  analyticsRetryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  analyticsEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  analyticsEmptyText: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 16,
  },

  // New comprehensive analytics styles
  analyticsInfoGrid: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },

  analyticsInfoCard: {
    flex: 1,
    backgroundColor: theme.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.outline + '30',
  },

  analyticsInfoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 8,
  },

  analyticsInfoCardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },

  analyticsInfoCardSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 4,
  },

  analyticsInfoCardDetail: {
    fontSize: 12,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },

  analyticsCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },

  analyticsDetailsList: {
    gap: 12,
  },

  analyticsResultGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  analyticsResultItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  analyticsResultLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
  },

  analyticsResultValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  analyticsStarRating: {
    flexDirection: 'row',
    gap: 2,
  },

  analyticsSolutionsList: {
    gap: 8,
    marginTop: 8,
  },

  analyticsSolutionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  analyticsSolutionText: {
    fontSize: 14,
    color: theme.text,
    flex: 1,
  },

  analyticsToolsSection: {
    marginTop: 16,
    gap: 12,
  },

  analyticsToolsGroup: {
    gap: 8,
  },

  analyticsToolsGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },

  analyticsWorkloadSection: {
    marginTop: 16,
  },

  analyticsWorkloadDetails: {
    marginTop: 8,
  },

  analyticsConditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  analyticsConditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
    minWidth: 120,
  },

  analyticsConditionLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    flex: 1,
  },

  analyticsConditionValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
  },

  analyticsSkillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },

  analyticsSkillItem: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
  },

  analyticsSkillLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },

  analyticsSkillValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  analyticsLearningSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.outline + '30',
    paddingTop: 16,
  },

  analyticsLearningTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },

  analyticsLearningGroup: {
    marginBottom: 12,
  },

  analyticsLearningGroupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 8,
  },

  analyticsLearningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },

  analyticsLearningText: {
    fontSize: 13,
    color: theme.text,
    flex: 1,
    lineHeight: 18,
  },

  analyticsSkillTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  analyticsSkillTag: {
    backgroundColor: theme.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  analyticsSkillTagText: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '500',
  },

  analyticsNextSkill: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    fontStyle: 'italic',
  },

  analyticsEfficiencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },

  analyticsEfficiencyItem: {
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
  },

  analyticsEfficiencyLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },

  analyticsEfficiencyValue: {
    alignItems: 'center',
    gap: 4,
  },

  analyticsEfficiencyImprovement: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },

  analyticsOverallImprovement: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.surfaceVariant,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },

  analyticsOverallLabel: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '600',
  },

  analyticsOverallValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  analyticsHabitsGrid: {
    gap: 12,
    marginBottom: 16,
  },

  analyticsHabitLabel: {
    fontSize: 13,
    color: theme.textSecondary,
    flex: 1,
  },

  analyticsHabitValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
    textAlign: 'right',
  },

  analyticsStrengthsSection: {
    marginTop: 12,
  },

  analyticsStrengthsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },

  analyticsStrengthsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  analyticsStrengthTag: {
    backgroundColor: '#10B981' + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  analyticsStrengthText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },

  analyticsImprovementSection: {
    marginTop: 12,
  },

  analyticsImprovementTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 8,
  },

  analyticsImprovementList: {
    gap: 6,
  },

  analyticsImprovementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  analyticsImprovementText: {
    fontSize: 13,
    color: theme.text,
    flex: 1,
  },

  analyticsMotivationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },

  analyticsMotivationItem: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
  },

  analyticsMotivationLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },

  analyticsMotivationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  analyticsMotivationFactors: {
    marginTop: 12,
  },

  analyticsMotivationFactorsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 8,
  },

  analyticsMotivationFactorsList: {
    gap: 6,
  },

  analyticsMotivationFactor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  analyticsMotivationFactorText: {
    fontSize: 13,
    color: theme.text,
    flex: 1,
  },

  // Activity Patterns Styles
  analyticsFrequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },

  analyticsFrequencyItem: {
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
  },

  analyticsFrequencyLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },

  analyticsFrequencyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'center',
  },

  analyticsFrequencyDetails: {
    gap: 8,
  },

  analyticsTemporalSection: {
    marginBottom: 16,
  },

  analyticsTemporalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 8,
  },

  analyticsTimeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  analyticsTimeSlot: {
    backgroundColor: theme.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  analyticsTimeSlotText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.primary,
  },

  analyticsSeasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  analyticsSeasonItem: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
  },

  analyticsSeasonLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },

  analyticsSeasonValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'center',
  },

  // Effectiveness Analysis Styles
  analyticsEffectivenessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },

  analyticsEffectivenessItem: {
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
  },

  analyticsEffectivenessLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },

  analyticsEffectivenessValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  analyticsEvaluationSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.outline + '30',
    paddingTop: 16,
  },

  analyticsEvaluationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },

  analyticsEvaluationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },

  analyticsEvaluationItem: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
  },

  analyticsEvaluationLabel: {
    fontSize: 11,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },

  analyticsEvaluationValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  analyticsOutcomesSection: {
    marginTop: 12,
  },

  analyticsOutcomesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 8,
  },

  analyticsOutcomesList: {
    gap: 6,
  },

  analyticsOutcomeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  analyticsOutcomeText: {
    fontSize: 13,
    color: theme.text,
    flex: 1,
  },

  // Learning Analysis Styles
  analyticsExperienceSection: {
    marginBottom: 16,
  },

  analyticsExperienceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 8,
  },

  analyticsExperienceGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  analyticsExperienceCard: {
    flex: 1,
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  analyticsExperienceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 4,
  },

  analyticsExperienceLabel: {
    fontSize: 11,
    color: theme.textSecondary,
    textAlign: 'center',
  },

  analyticsProgressBar: {
    height: 6,
    backgroundColor: theme.outline + '30',
    borderRadius: 3,
    marginTop: 8,
  },

  analyticsProgressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 3,
  },

  analyticsSkillDevelopmentSection: {
    marginTop: 16,
  },

  analyticsSkillDevelopmentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },

  // Comparison Analysis Styles
  analyticsSelfComparisonSection: {
    marginBottom: 16,
  },

  analyticsSelfComparisonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 8,
  },

  analyticsSelfComparisonGrid: {
    flexDirection: 'row',
    gap: 12,
  },

  analyticsSelfComparisonItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
  },

  analyticsSelfComparisonLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },

  analyticsSelfComparisonValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  analyticsPersonalAverage: {
    alignItems: 'center',
    backgroundColor: theme.surfaceVariant,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },

  analyticsPersonalAverageValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primary,
  },

  analyticsPersonalAverageLabel: {
    fontSize: 12,
    color: theme.textSecondary,
  },

  analyticsAspectsSection: {
    marginTop: 12,
  },

  analyticsAspectsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },

  analyticsAspectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  analyticsAspectTag: {
    backgroundColor: '#10B981' + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  analyticsAspectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },

  analyticsCommunityRanking: {
    marginBottom: 16,
  },

  analyticsRankingMain: {
    alignItems: 'center',
    backgroundColor: theme.surfaceVariant,
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },

  analyticsRankingPosition: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.primary,
  },

  analyticsRankingLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },

  analyticsRankingDetails: {
    flexDirection: 'row',
    gap: 16,
  },

  analyticsRankingDetail: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
  },

  analyticsRankingDetailLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
  },

  analyticsRankingDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },

  // Recommendations Styles
  analyticsRecommendationsSection: {
    marginBottom: 16,
  },

  analyticsRecommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 8,
  },

  analyticsPriorityList: {
    gap: 8,
  },

  analyticsPriorityItem: {
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
  },

  analyticsPriorityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  analyticsPriorityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
  },

  analyticsPriorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  analyticsPriorityBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },

  analyticsPriorityTimeframe: {
    fontSize: 12,
    color: theme.textSecondary,
  },

  analyticsGoalsSection: {
    marginTop: 16,
  },

  analyticsGoalsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },

  analyticsGoalsList: {
    gap: 8,
  },

  analyticsGoalItem: {
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  analyticsGoalInfo: {
    flex: 1,
  },

  analyticsGoalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },

  analyticsGoalDescription: {
    fontSize: 13,
    color: theme.textSecondary,
  },

  analyticsChallengesSection: {
    marginTop: 16,
  },

  analyticsChallengesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },

  analyticsChallengesList: {
    gap: 8,
  },

  analyticsChallengeItem: {
    backgroundColor: '#F59E0B' + '10',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },

  analyticsChallengeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 4,
  },

  analyticsChallengeDescription: {
    fontSize: 13,
    color: theme.text,
  },

  analyticsRiskSection: {
    marginTop: 16,
  },

  analyticsRiskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },

  analyticsRiskList: {
    gap: 8,
  },

  analyticsRiskItem: {
    backgroundColor: '#EF4444' + '10',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },

  analyticsRiskLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 4,
  },

  analyticsRiskDescription: {
    fontSize: 13,
    color: theme.text,
  },

  // Enhanced Stats Section Styles
  emptyText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },

  dailyStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },

  dailyStatItem: {
    alignItems: 'center',
    minWidth: 60,
    paddingVertical: 8,
  },

  dailyBarContainer: {
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },

  dailyBar: {
    width: 24,
    borderRadius: 12,
    minHeight: 4,
  },

  dailyCount: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },

  dailyDate: {
    fontSize: 10,
    marginBottom: 4,
  },

  dailyBreakdownContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
    marginTop: 2,
  },

  dailyBreakdownDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  dailyBreakdownMore: {
    fontSize: 8,
    color: theme.textSecondary,
    marginLeft: 2,
  },

  monthlyStatsContainer: {
    gap: 12,
    paddingHorizontal: 16,
  },

  monthlyStatCard: {
    backgroundColor: theme.surfaceVariant,
    borderRadius: 12,
    padding: 16,
  },

  monthlyStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  monthlyStatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },

  monthlyStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.primary,
  },

  monthlyStatDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  monthlyStatDetail: {
    alignItems: 'center',
  },

  monthlyStatDetailLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
  },

  monthlyStatDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },

  // Additional Analytics Modal Styles
  analyticsOutcomesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },

  analyticsOutcomeLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },

  analyticsOutcomeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  analyticsOutcomeListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },

  analyticsXpSection: {
    marginBottom: 16,
  },

  analyticsXpMain: {
    alignItems: 'center',
    backgroundColor: theme.surfaceVariant,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  analyticsXpLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },

  analyticsXpValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  analyticsXpProgress: {
    alignItems: 'center',
  },

  analyticsXpProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: theme.outline + '30',
    borderRadius: 4,
    marginBottom: 8,
  },

  analyticsXpProgressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 4,
  },

  analyticsXpProgressText: {
    fontSize: 12,
    color: theme.textSecondary,
  },

  analyticsBonusSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.outline + '30',
    paddingTop: 16,
  },

  analyticsBonusTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },

  analyticsBonusList: {
    gap: 8,
  },

  analyticsBonusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  analyticsBonusText: {
    fontSize: 13,
    color: theme.text,
    flex: 1,
  },

  analyticsSkillsSection: {
    marginTop: 16,
  },

  analyticsSkillsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },

  analyticsImprovedSkills: {
    gap: 12,
  },

  analyticsImprovedSkill: {
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
  },

  analyticsImprovedSkillName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },

  analyticsImprovedSkillProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  analyticsImprovedSkillLevel: {
    fontSize: 12,
    color: theme.textSecondary,
  },

  analyticsImprovedSkillChange: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Learning Analysis Advanced Styles
  analyticsLevelUpSection: {
    backgroundColor: theme.primary + '15',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },

  analyticsLevelUpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 8,
  },

  analyticsLevelUpText: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '600',
  },

  analyticsSkillEvidence: {
    marginTop: 8,
    paddingLeft: 8,
  },

  analyticsSkillEvidenceText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
  },

  analyticsLearningPathSection: {
    marginTop: 16,
  },

  analyticsLearningPathTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },

  analyticsLearningPath: {
    gap: 12,
  },

  analyticsLearningPathStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
  },

  analyticsLearningPathNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  analyticsLearningPathNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.onPrimary,
  },

  analyticsLearningPathStepText: {
    fontSize: 13,
    color: theme.text,
    flex: 1,
  },

  analyticsLessonsSection: {
    marginTop: 16,
  },

  analyticsLessonsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },

  analyticsLessonItem: {
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },

  analyticsLessonText: {
    fontSize: 13,
    color: theme.text,
    marginBottom: 8,
  },

  analyticsLessonSource: {
    fontSize: 11,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },

  analyticsLessonImportance: {
    marginTop: 4,
  },

  analyticsLessonImportanceText: {
    fontSize: 11,
    color: theme.primary,
    fontWeight: '600',
  },

  analyticsBestPracticesSection: {
    marginTop: 16,
  },

  analyticsBestPracticesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },

  analyticsBestPracticesList: {
    gap: 8,
  },

  analyticsBestPracticeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  analyticsBestPracticeText: {
    fontSize: 13,
    color: theme.text,
    flex: 1,
  },

  // Comparison Styles
  comparisonGrid: {
    gap: 8,
  },

  comparisonGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },

  comparisonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },

  comparisonLabel: {
    fontSize: 13,
    color: theme.textSecondary,
  },

  comparisonValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
  },

  progressOverTimeContainer: {
    marginTop: 12,
  },

  progressTimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  progressTimeItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.surfaceVariant,
    padding: 8,
    borderRadius: 6,
  },

  progressTimeLabel: {
    fontSize: 11,
    color: theme.textSecondary,
    marginBottom: 2,
  },

  progressTimeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text,
  },

  // Ranking Styles
  rankingContainer: {
    gap: 8,
  },

  rankingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
  },

  rankingLabel: {
    fontSize: 13,
    color: theme.textSecondary,
  },

  rankingValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.primary,
  },

  // Benchmark Styles
  benchmarkContainer: {
    marginTop: 12,
  },

  benchmarkGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },

  benchmarkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },

  benchmarkLabel: {
    fontSize: 13,
    color: theme.textSecondary,
  },

  benchmarkValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
  },

  // Immediate Actions Styles
  immediateActionsContainer: {
    marginTop: 12,
  },

  immediateActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },

  immediateActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },

  actionPriorityBadge: {
    backgroundColor: theme.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  actionPriorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  actionText: {
    fontSize: 13,
    color: theme.text,
    flex: 1,
  },

  // Learning Recommendations Styles
  learningRecommendationsContainer: {
    marginTop: 12,
  },

  learningRecommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },

  learningRecommendationItem: {
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },

  learningSkillName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },

  learningBenefit: {
    fontSize: 12,
    color: theme.textSecondary,
  },

  // Predictions Styles
  predictionsContainer: {
    gap: 12,
  },

  predictionItem: {
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
  },

  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  predictionActivity: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },

  predictionProbability: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.primary,
  },

  predictionDate: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
  },

  predictionReasoning: {
    fontSize: 11,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },

  // Warnings Styles
  warningsContainer: {
    marginTop: 12,
  },

  warningsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },

  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },

  warningText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
  },

  // Risks Styles
  risksContainer: {
    marginTop: 12,
  },

  risksTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },

  riskItem: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },

  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  riskText: {
    fontSize: 13,
    color: '#991B1B',
    flex: 1,
  },

  riskProbability: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },

  riskPrevention: {
    fontSize: 11,
    color: '#7F1D1D',
    fontStyle: 'italic',
  },

  // Enhanced Stats Section Specific Styles
  enhancedStatsContainer: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.outline + '30',
  },

  enhancedStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  enhancedStatsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  enhancedStatsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },

  enhancedStatsMetadata: {
    fontSize: 12,
    color: theme.textSecondary,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.surfaceVariant,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },

  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },

  tabButtonActive: {
    backgroundColor: theme.primary,
  },

  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },

  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  tabContent: {
    minHeight: 200,
  },

  monthlyStatCount: {
    fontSize: 14,
    fontWeight: '600',
  },

  monthlyStatMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  monthlyMetricItem: {
    alignItems: 'center',
  },

  monthlyMetricLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
  },

  monthlyMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },

  monthlyProgressContainer: {
    marginTop: 8,
  },

  monthlyProgressTrack: {
    height: 8,
    backgroundColor: theme.outline + '20',
    borderRadius: 4,
    marginBottom: 4,
  },

  monthlyProgressFill: {
    height: '100%',
    borderRadius: 4,
  },

  monthlyProgressText: {
    fontSize: 11,
    color: theme.textSecondary,
    textAlign: 'center',
  },

  generationInfo: {
    fontSize: 11,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border + '20',
  },

  // JournalDetailedStats Specific Styles
  dateRangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },

  dateRangeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },

  dateRangeOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },

  dateRangeOptionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border + '40',
    alignItems: 'center',
  },

  dateRangeOptionSelected: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },

  dateRangeOptionText: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: '500',
  },

  dateRangeOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  overviewStatsCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border + '30',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },

  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },

  overviewStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  overviewStatItem: {
    flex: 1,
    minWidth: 140,
    backgroundColor: theme.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },

  overviewStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  overviewStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },

  overviewStatLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
  },

  activityHighlightsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  activityTypesCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border + '30',
  },

  smallSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },

  smallSectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },

  activityTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  activityTypeIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  activityTypeNameSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },

  moreText: {
    fontSize: 11,
    color: theme.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },

  highlightsCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border + '30',
    gap: 12,
  },

  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  highlightIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },

  highlightContent: {
    flex: 1,
  },

  highlightLabel: {
    fontSize: 11,
    color: theme.textSecondary,
    marginBottom: 2,
  },

  highlightValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },

  highlightSubtext: {
    fontSize: 11,
    color: theme.textSecondary,
  },

  trendsSection: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border + '30',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 16,
  },

  trendsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },

  trendItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },

  trendBar: {
    height: 80,
    width: 24,
    backgroundColor: theme.surfaceVariant,
    borderRadius: 12,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  trendBarFill: {
    width: '100%',
    borderRadius: 12,
    minHeight: 4,
  },

  trendCount: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text,
  },

  trendLabel: {
    fontSize: 10,
    color: theme.textSecondary,
    textAlign: 'center',
  },

  trendChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  trendChangeText: {
    fontSize: 10,
    fontWeight: '600',
  },

  trendsNote: {
    fontSize: 11,
    color: theme.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  gardenBreakdownSection: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border + '30',
  },

  gardenStatsItem: {
    backgroundColor: theme.surfaceVariant,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  gardenStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  gardenStatsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  gardenStatsInfo: {
    flex: 1,
  },

  gardenStatsName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },

  gardenStatsCount: {
    fontSize: 12,
    color: theme.textSecondary,
  },

  gardenStatsLastActivity: {
    fontSize: 11,
    color: theme.textSecondary,
  },

  gardenActivityBreakdown: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },

  gardenActivityType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 8,
    padding: 8,
    gap: 6,
  },

  gardenActivityTypeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  gardenActivityTypeName: {
    fontSize: 11,
    color: theme.text,
    fontWeight: '500',
  },

  gardenActivityTypeCount: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: '600',
  },

  // ActivityAnalyticsModal Missing Styles
  environmentalDataContainer: {
    backgroundColor: theme.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },

  environmentalDataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },

  environmentalDataItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 12,
    borderRadius: 8,
  },

  environmentalDataLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },

  environmentalDataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary,
    textAlign: 'center',
  },

  analyticsSubsection: {
    marginBottom: 24,
  },

  analyticsSubsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },

  skillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  skillItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  skillLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },

  skillValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'center',
  },

  learningProgressContainer: {
    marginTop: 16,
    backgroundColor: theme.surfaceVariant,
    borderRadius: 8,
    padding: 12,
  },

  progressItem: {
    marginBottom: 8,
  },

  progressLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 2,
  },

  progressValue: {
    fontSize: 13,
    color: theme.text,
  },

  efficiencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  efficiencyItem: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  efficiencyLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },

  efficiencyValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  experienceContainer: {
    gap: 8,
  },

  experienceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.surfaceVariant,
    padding: 12,
    borderRadius: 8,
  },

  experienceLabel: {
    fontSize: 13,
    color: theme.textSecondary,
  },

  experienceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
  },

  levelUpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },

  levelUpText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },

  newSkillsContainer: {
    marginTop: 12,
  },

  newSkillsLabel: {
    fontSize: 13,
    color: theme.text,
    marginBottom: 8,
    fontWeight: '600',
  },

  newSkillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },

  newSkillText: {
    fontSize: 12,
    color: theme.text,
  },

  improvedSkillsContainer: {
    marginTop: 12,
  },

  improvedSkillsLabel: {
    fontSize: 13,
    color: theme.text,
    marginBottom: 8,
    fontWeight: '600',
  },

  improvedSkillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.surfaceVariant,
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },

  improvedSkillName: {
    fontSize: 12,
    color: theme.text,
  },

  improvedSkillProgress: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '600',
  },

  lessonsContainer: {
    marginTop: 12,
  },

  lessonsLabel: {
    fontSize: 13,
    color: theme.text,
    marginBottom: 8,
    fontWeight: '600',
  },

  lessonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
    backgroundColor: theme.surfaceVariant,
    padding: 8,
    borderRadius: 6,
  },

  lessonText: {
    fontSize: 12,
    color: theme.text,
    flex: 1,
  },

  bestPracticesContainer: {
    marginTop: 12,
  },

  bestPracticesLabel: {
    fontSize: 13,
    color: theme.text,
    marginBottom: 8,
    fontWeight: '600',
  },

  bestPracticeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
    backgroundColor: theme.surfaceVariant,
    padding: 8,
    borderRadius: 6,
  },

  bestPracticeText: {
    fontSize: 12,
    color: theme.text,
    flex: 1,
  },

  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border + '30',
  },

  analyticsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },

  analyticsScrollView: {
    flex: 1,
  },
});