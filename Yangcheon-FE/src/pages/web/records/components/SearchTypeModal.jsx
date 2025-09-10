import { useState, useEffect } from "react";
import * as S from "../style";
import { civilAffairsTypes } from "../../../../data/workRecordsData";

const SearchTypeModal = ({
  isOpen,
  onClose,
  onConfirm,
  initialSelectedTypes = [],
}) => {
  const [selectedTypes, setSelectedTypes] = useState(initialSelectedTypes);
  const [isAllSelected, setIsAllSelected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedTypes(initialSelectedTypes);
      setIsAllSelected(
        initialSelectedTypes.length === civilAffairsTypes.length
      );
    }
  }, [isOpen, initialSelectedTypes]);

  const handleAllToggle = () => {
    if (isAllSelected) {
      setSelectedTypes([]);
      setIsAllSelected(false);
    } else {
      setSelectedTypes([...civilAffairsTypes]);
      setIsAllSelected(true);
    }
  };

  const handleTypeToggle = (type) => {
    const newSelectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];

    setSelectedTypes(newSelectedTypes);
    setIsAllSelected(newSelectedTypes.length === civilAffairsTypes.length);
  };

  const handleConfirm = () => {
    onConfirm(selectedTypes);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <S.ModalTitle>검색 유형 선택</S.ModalTitle>
          <S.CloseButton onClick={onClose}>×</S.CloseButton>
        </S.ModalHeader>

        <S.ModalBody>
          <S.CheckboxGroup>
            <S.CheckboxItem>
              <S.CheckboxInput
                type="checkbox"
                checked={isAllSelected}
                onChange={handleAllToggle}
              />
              <S.CheckboxLabel $isMain>전체</S.CheckboxLabel>
            </S.CheckboxItem>

            {civilAffairsTypes.map((type) => (
              <S.CheckboxItem key={type}>
                <S.CheckboxInput
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => handleTypeToggle(type)}
                />
                <S.CheckboxLabel>{type}</S.CheckboxLabel>
              </S.CheckboxItem>
            ))}
          </S.CheckboxGroup>
        </S.ModalBody>

        <S.ModalFooter>
          <S.ModalButton onClick={onClose}>취소</S.ModalButton>
          <S.ModalButton $primary onClick={handleConfirm}>
            확인
          </S.ModalButton>
        </S.ModalFooter>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

export default SearchTypeModal;
