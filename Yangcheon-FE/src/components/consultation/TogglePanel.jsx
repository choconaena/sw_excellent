import * as S from "./ConsultationComponentStyles";

const Toggle = ({ label, isOn, onToggle }) => {
  return (
    <S.ToggleSection>
      {label && <S.ToggleLabel>{label}</S.ToggleLabel>}
      <S.ToggleSwitch $isOn={isOn} onClick={onToggle}>
        <S.ToggleSlider $isOn={isOn} />
        <S.ToggleText $isOn={isOn}>{isOn ? "ON" : "OFF"}</S.ToggleText>
      </S.ToggleSwitch>
    </S.ToggleSection>
  );
};

export default Toggle;
