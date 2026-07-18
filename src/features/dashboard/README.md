# Feature Slice: Dashboard

This slice handles the professor's workspace, allowing calendar slot administration, lesson confirmations/rejections/updates, and overview metrics.

## Structure
- `/actions`: createSlot, removeSlot, confirmLesson, rejectLesson, updateLessonTime, cancelLesson.
- `/components`: DashboardView, LessonTabs, CreateSlotDialog, EditLessonDialog.
- `/types`: Types related to dashboard states and scheduling statistics.
