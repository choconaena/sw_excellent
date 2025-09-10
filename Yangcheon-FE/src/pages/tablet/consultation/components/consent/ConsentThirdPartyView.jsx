// ConsentThirdPartyView.jsx
import React from "react";
import ConsentBase from "./ConsentBase";

export default function ConsentThirdPartyView({ onAgree, onDisagree }) {
  return (
    <ConsentBase
      title="개인정보 수집·이용 동의서"
      listHeaderText="개인정보 제3자 제공 내역"
      intro={null}
      items={[
        { label: "제공받는 기관 :", value: "안심하이" },
        {
          label: "제공 목적 :",
          value: "음성 인식 AI 서비스 개발을 위한 학습데이터 활용",
        },
        { label: "제공하는 항목 :", value: "음성 데이터" },
        {
          label: "보유 및 이용 기간 :",
          value: (
            <>
              <u>
                <b>인공지능 모델 학습 완료일로부터 1년</b>
              </u>
              <br />
              (개인정보 활용 목적 달성 후 「개인정보보호법 제21조」에 따라 보유
              후 파기)
            </>
          ),
        },
      ]}
      confirmText="개인정보 제3자 제공에 동의하십니까?"
      onAgree={onAgree}
      onDisagree={onDisagree}
    />
  );
}
