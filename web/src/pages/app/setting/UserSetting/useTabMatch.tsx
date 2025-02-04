import { useTranslation } from "react-i18next";

import {
  BillingIcon,
  CardIcon,
  ChargeIcon,
  CostIcon,
  InviteIcon,
  PATIcon,
  StandardIcon,
  UserIcon,
} from "@/components/CommonIcon";

import { TabKeys } from "@/pages/app/setting";
import BillingDetails from "@/pages/app/setting/BillingDetails";
import CardRedemption from "@/pages/app/setting/CardRedemption";
import PATList from "@/pages/app/setting/PATList";
import PricingStandards from "@/pages/app/setting/PricingStandards";
import RechargeHistory from "@/pages/app/setting/RechargeHistory";
import Usage from "@/pages/app/setting/Usage";
import UserInfo from "@/pages/app/setting/UserInfo";
import UserInvite from "@/pages/app/setting/UserInvite";

export default function useTabMatch(type: string) {
  const { t } = useTranslation();

  const User_TabMatch = [
    {
      key: TabKeys.UserInfo,
      name: t("SettingPanel.UserInfo"),
      component: <UserInfo />,
      icon: <UserIcon boxSize={4} />,
    },
    {
      key: TabKeys.UserInvite,
      name: t("SettingPanel.UserInvite"),
      component: <UserInvite />,
      icon: <InviteIcon boxSize={4} />,
    },
    {
      key: TabKeys.PAT,
      name: t("Personal Access Token"),
      component: <PATList />,
      icon: <PATIcon boxSize={4} />,
    },
  ];

  const Usage_TabMatch = [
    {
      key: TabKeys.CostOverview,
      name: String(t("SettingPanel.CostOverview")),
      component: <Usage />,
      icon: <CostIcon boxSize={4} />,
    },
    {
      key: TabKeys.CardRedemption,
      name: String(t("SettingPanel.CardRedemption")),
      component: <CardRedemption />,
      icon: <CardIcon boxSize={4} />,
    },
    {
      key: TabKeys.BillingDetails,
      name: String(t("SettingPanel.BillingDetails")),
      component: <BillingDetails />,
      icon: <BillingIcon boxSize={4} />,
    },
    {
      key: TabKeys.RechargeHistory,
      name: String(t("SettingPanel.RechargeHistory")),
      component: <RechargeHistory />,
      icon: <ChargeIcon boxSize={4} />,
    },
    {
      key: TabKeys.PricingStandards,
      name: String(t("SettingPanel.PricingStandards")),
      component: <PricingStandards />,
      icon: <StandardIcon boxSize={4} />,
    },
  ];

  if (type === "user") {
    return User_TabMatch;
  } else if (type === "usage") {
    return Usage_TabMatch;
  }
}
