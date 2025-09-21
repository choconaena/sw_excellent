'''
변환 후 특정 태그들 남아있으면 지우는 코드(간단 ver) 
'''

def clear_leftover_markers(hwp, replace_with: str = " ", extra_markers: list[str] | None = None) -> int:
    """
    지정한 마커들만 문서 전역에서 공백(replace_with)으로 치환한다.
    - 빠르고 안정적 (Clipboard/Export 사용 안 함)
    - 기본 마커 목록 + 필요 시 extra_markers로 추가 가능
    반환: 처리 시도한 마커 개수
    """
    # 기본 등록 마커
    markers = [
        "<applicantData.gender>",
        "<applicantData.passport>",
        "<applicantData.businessNumber>",
        "<applicantData.fax>",
        "<methodData.otherDisclosureMethod>",
        "<methodData.otherReceiveMethod>",
        "<feeData.exemptionReason>",
    ]

    if extra_markers:
        # 중복 없이 추가
        for m in extra_markers:
            if m not in markers:
                markers.append(m)

    # 각 마커별로 AllReplace 실행 (문서 전체)
    for mk in markers:
        act = hwp.CreateAction("AllReplace")
        ps = act.CreateSet()
        act.GetDefault(ps)
        ps.SetItem("FindString", mk)
        ps.SetItem("ReplaceString", replace_with)
        ps.SetItem("Scope", 0)           # 0: 문서 전체
        ps.SetItem("FindType", 1)        # 일반 찾기
        ps.SetItem("IgnoreMessage", True)
        ps.SetItem("MatchCase", False)
        ps.SetItem("IgnoreSpace", True)
        act.Execute(ps)

    print(f"🧹 지정 마커 정리 완료: {len(markers)}개 처리")
    return len(markers)
