import type { PrimeVueConfiguration } from "primevue/config";

export const usePrimevueI18n = () => {
  const { locale, t } = useI18n();
  const primevue = ref<{
    config: PrimeVueConfiguration;
  } | null>(null);

  const handleLocaleChange = () => {
    if (primevue.value?.config.locale) {
      primevue.value.config.locale.startsWith = t("primevue.startsWith");
      primevue.value.config.locale.contains = t("primevue.contains");
      primevue.value.config.locale.notContains = t("primevue.notContains");
      primevue.value.config.locale.endsWith = t("primevue.endsWith");
      primevue.value.config.locale.equals = t("primevue.equals");
      primevue.value.config.locale.notEquals = t("primevue.notEquals");
      primevue.value.config.locale.noFilter = t("primevue.noFilter");
      primevue.value.config.locale.lt = t("primevue.lt");
      primevue.value.config.locale.lte = t("primevue.lte");
      primevue.value.config.locale.gt = t("primevue.gt");
      primevue.value.config.locale.gte = t("primevue.gte");
      primevue.value.config.locale.dateIs = t("primevue.dateIs");
      primevue.value.config.locale.dateIsNot = t("primevue.dateIsNot");
      primevue.value.config.locale.dateBefore = t("primevue.dateBefore");
      primevue.value.config.locale.dateAfter = t("primevue.dateAfter");
      primevue.value.config.locale.clear = t("primevue.clear");
      primevue.value.config.locale.apply = t("primevue.apply");
      primevue.value.config.locale.matchAll = t("primevue.matchAll");
      primevue.value.config.locale.matchAny = t("primevue.matchAny");
      primevue.value.config.locale.addRule = t("primevue.addRule");
      primevue.value.config.locale.removeRule = t("primevue.removeRule");
      primevue.value.config.locale.accept = t("primevue.accept");
      primevue.value.config.locale.reject = t("primevue.reject");
      primevue.value.config.locale.choose = t("primevue.choose");
      primevue.value.config.locale.upload = t("primevue.upload");
      primevue.value.config.locale.cancel = t("primevue.cancel");
      primevue.value.config.locale.completed = t("primevue.completed");
      primevue.value.config.locale.pending = t("primevue.pending");

      primevue.value.config.locale.fileSizeTypes = [
        t("primevue.fileSizeTypeB"),
        t("primevue.fileSizeTypeKB"),
        t("primevue.fileSizeTypeMB"),
        t("primevue.fileSizeTypeGB"),
        t("primevue.fileSizeTypeTB"),
        t("primevue.fileSizeTypePB"),
        t("primevue.fileSizeTypeEB"),
        t("primevue.fileSizeTypeZB"),
        t("primevue.fileSizeTypeYB"),
      ];

      primevue.value.config.locale.dayNames = [
        t("primevue.daySunday"),
        t("primevue.dayMonday"),
        t("primevue.dayTuesday"),
        t("primevue.dayWednesday"),
        t("primevue.dayThursday"),
        t("primevue.dayFriday"),
        t("primevue.daySaturday"),
      ];
      primevue.value.config.locale.dayNamesShort = [
        t("primevue.dayShortSunday"),
        t("primevue.dayShortMonday"),
        t("primevue.dayShortTuesday"),
        t("primevue.dayShortWednesday"),
        t("primevue.dayShortThursday"),
        t("primevue.dayShortFriday"),
        t("primevue.dayShortSaturday"),
      ];
      primevue.value.config.locale.dayNamesMin = [
        t("primevue.dayMinSunday"),
        t("primevue.dayMinMonday"),
        t("primevue.dayMinTuesday"),
        t("primevue.dayMinWednesday"),
        t("primevue.dayMinThursday"),
        t("primevue.dayMinFriday"),
        t("primevue.dayMinSaturday"),
      ];

      primevue.value.config.locale.monthNames = [
        t("primevue.monthJanuary"),
        t("primevue.monthFebruary"),
        t("primevue.monthMarch"),
        t("primevue.monthApril"),
        t("primevue.monthMay"),
        t("primevue.monthJune"),
        t("primevue.monthJuly"),
        t("primevue.monthAugust"),
        t("primevue.monthSeptember"),
        t("primevue.monthOctober"),
        t("primevue.monthNovember"),
        t("primevue.monthDecember"),
      ];
      primevue.value.config.locale.monthNamesShort = [
        t("primevue.monthShortJanuary"),
        t("primevue.monthShortFebruary"),
        t("primevue.monthShortMarch"),
        t("primevue.monthShortApril"),
        t("primevue.monthShortMay"),
        t("primevue.monthShortJune"),
        t("primevue.monthShortJuly"),
        t("primevue.monthShortAugust"),
        t("primevue.monthShortSeptember"),
        t("primevue.monthShortOctober"),
        t("primevue.monthShortNovember"),
        t("primevue.monthShortDecember"),
      ];

      primevue.value.config.locale.chooseYear = t("primevue.chooseYear");

      primevue.value.config.locale.chooseMonth = t("primevue.chooseMonth");
      primevue.value.config.locale.chooseDate = t("primevue.chooseDate");
      primevue.value.config.locale.prevDecade = t("primevue.prevDecade");
      primevue.value.config.locale.nextDecade = t("primevue.nextDecade");
      primevue.value.config.locale.prevYear = t("primevue.prevYear");
      primevue.value.config.locale.nextYear = t("primevue.nextYear");
      primevue.value.config.locale.prevMonth = t("primevue.prevMonth");
      primevue.value.config.locale.nextMonth = t("primevue.nextMonth");
      primevue.value.config.locale.prevHour = t("primevue.prevHour");
      primevue.value.config.locale.nextHour = t("primevue.nextHour");
      primevue.value.config.locale.prevMinute = t("primevue.prevMinute");
      primevue.value.config.locale.nextMinute = t("primevue.nextMinute");
      primevue.value.config.locale.prevSecond = t("primevue.prevSecond");
      primevue.value.config.locale.nextSecond = t("primevue.nextSecond");
      primevue.value.config.locale.am = t("primevue.am");
      primevue.value.config.locale.pm = t("primevue.pm");
      primevue.value.config.locale.today = t("primevue.today");
      primevue.value.config.locale.weekHeader = t("primevue.weekHeader");
      primevue.value.config.locale.firstDayOfWeek = 1;
      primevue.value.config.locale.dateFormat = t("primevue.dateFormat");
      primevue.value.config.locale.weak = t("primevue.weak");
      primevue.value.config.locale.medium = t("primevue.medium");
      primevue.value.config.locale.strong = t("primevue.strong");
      primevue.value.config.locale.passwordPrompt = t(
        "primevue.passwordPrompt",
      );
      primevue.value.config.locale.searchMessage = t("primevue.searchMessage");
      primevue.value.config.locale.selectionMessage = t(
        "primevue.selectionMessage",
      );
      primevue.value.config.locale.emptySelectionMessage = t(
        "primevue.emptySelectionMessage",
      );
      primevue.value.config.locale.emptySearchMessage = t(
        "primevue.emptySearchMessage",
      );
      primevue.value.config.locale.fileChosenMessage = t(
        "primevue.fileChosenMessage",
      );
      primevue.value.config.locale.noFileChosenMessage = t(
        "primevue.noFileChosenMessage",
      );
      primevue.value.config.locale.emptyMessage = t("primevue.emptyMessage");

      if (primevue.value.config.locale.aria) {
        primevue.value.config.locale.aria.trueLabel = t(
          "primevue.aria.trueLabel",
        );
        primevue.value.config.locale.aria.falseLabel = t(
          "primevue.aria.falseLabel",
        );
        primevue.value.config.locale.aria.nullLabel = t(
          "primevue.aria.nullLabel",
        );
        primevue.value.config.locale.aria.star = t("primevue.aria.star");
        primevue.value.config.locale.aria.stars = t("primevue.aria.stars");
        primevue.value.config.locale.aria.selectAll = t(
          "primevue.aria.selectAll",
        );
        primevue.value.config.locale.aria.unselectAll = t(
          "primevue.aria.unselectAll",
        );
        primevue.value.config.locale.aria.close = t("primevue.aria.close");
        primevue.value.config.locale.aria.previous = t(
          "primevue.aria.previous",
        );
        primevue.value.config.locale.aria.next = t("primevue.aria.next");
        primevue.value.config.locale.aria.navigation = t(
          "primevue.aria.navigation",
        );
        primevue.value.config.locale.aria.scrollTop = t(
          "primevue.aria.scrollTop",
        );
        primevue.value.config.locale.aria.moveTop = t("primevue.aria.moveTop");
        primevue.value.config.locale.aria.moveUp = t("primevue.aria.moveUp");
        primevue.value.config.locale.aria.moveDown = t(
          "primevue.aria.moveDown",
        );
        primevue.value.config.locale.aria.moveBottom = t(
          "primevue.aria.moveBottom",
        );
        primevue.value.config.locale.aria.moveToTarget = t(
          "primevue.aria.moveToTarget",
        );
        primevue.value.config.locale.aria.moveToSource = t(
          "primevue.aria.moveToSource",
        );
        primevue.value.config.locale.aria.moveAllToTarget = t(
          "primevue.aria.moveAllToTarget",
        );
        primevue.value.config.locale.aria.moveAllToSource = t(
          "primevue.aria.moveAllToSource",
        );
        primevue.value.config.locale.aria.pageLabel = t(
          "primevue.aria.pageLabel",
        );
        primevue.value.config.locale.aria.firstPageLabel = t(
          "primevue.aria.firstPageLabel",
        );
        primevue.value.config.locale.aria.lastPageLabel = t(
          "primevue.aria.lastPageLabel",
        );
        primevue.value.config.locale.aria.nextPageLabel = t(
          "primevue.aria.nextPageLabel",
        );
        primevue.value.config.locale.aria.prevPageLabel = t(
          "primevue.aria.prevPageLabel",
        );
        primevue.value.config.locale.aria.rowsPerPageLabel = t(
          "primevue.aria.rowsPerPageLabel",
        );
        primevue.value.config.locale.aria.jumpToPageDropdownLabel = t(
          "primevue.aria.jumpToPageDropdownLabel",
        );
        primevue.value.config.locale.aria.jumpToPageInputLabel = t(
          "primevue.aria.jumpToPageInputLabel",
        );
        primevue.value.config.locale.aria.selectRow = t(
          "primevue.aria.selectRow",
        );
        primevue.value.config.locale.aria.unselectRow = t(
          "primevue.aria.unselectRow",
        );
        primevue.value.config.locale.aria.expandRow = t(
          "primevue.aria.expandRow",
        );
        primevue.value.config.locale.aria.collapseRow = t(
          "primevue.aria.collapseRow",
        );
        primevue.value.config.locale.aria.showFilterMenu = t(
          "primevue.aria.showFilterMenu",
        );
        primevue.value.config.locale.aria.hideFilterMenu = t(
          "primevue.aria.hideFilterMenu",
        );
        primevue.value.config.locale.aria.filterOperator = t(
          "primevue.aria.filterOperator",
        );
        primevue.value.config.locale.aria.filterConstraint = t(
          "primevue.aria.filterConstraint",
        );
        primevue.value.config.locale.aria.editRow = t("primevue.aria.editRow");
        primevue.value.config.locale.aria.saveEdit = t(
          "primevue.aria.saveEdit",
        );
        primevue.value.config.locale.aria.cancelEdit = t(
          "primevue.aria.cancelEdit",
        );
        primevue.value.config.locale.aria.listView = t(
          "primevue.aria.listView",
        );
        primevue.value.config.locale.aria.gridView = t(
          "primevue.aria.gridView",
        );
        primevue.value.config.locale.aria.slide = t("primevue.aria.slide");
        primevue.value.config.locale.aria.slideNumber = t(
          "primevue.aria.slideNumber",
        );
        primevue.value.config.locale.aria.zoomImage = t(
          "primevue.aria.zoomImage",
        );
        primevue.value.config.locale.aria.zoomIn = t("primevue.aria.zoomIn");
        primevue.value.config.locale.aria.zoomOut = t("primevue.aria.zoomOut");
        primevue.value.config.locale.aria.rotateRight = t(
          "primevue.aria.rotateRight",
        );
        primevue.value.config.locale.aria.rotateLeft = t(
          "primevue.aria.rotateLeft",
        );
      }
    }
  };

  onMounted(() => {
    primevue.value = usePrimeVue();
    handleLocaleChange();
  });

  watch(locale, handleLocaleChange);
};
