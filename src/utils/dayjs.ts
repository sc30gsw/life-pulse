import dayjsBase from "dayjs";
import "dayjs/locale/ja";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjsBase.extend(utc);
dayjsBase.extend(timezone);
dayjsBase.locale("ja");

export const dayjs = dayjsBase;
