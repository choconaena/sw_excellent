// src/views/work/WorkRecords/WorkRecords.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import MainLayout from "../../../layouts/MainLayout";
import SearchTypeModal from "./components/SearchTypeModal";
import Pagination from "./components/Pagination";
import * as S from "./style";
import { fetchGovResults } from "../../../services/constructionGovService"; // ✅ 서버 연동
import { API_BASE_URL } from "../../../config/env"; // ✅ 추가
import { downloadGovReport } from "../../../api/constructionGov";
import { useAuthStore } from "../../../store/authStore";

const ITEMS_PER_PAGE = 10;

const WorkRecords = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [allData, setAllData] = useState([]); // ✅ 서버 원본
  const [loading, setLoading] = useState(true); // ✅ 로딩
  const [error, setError] = useState(""); // ✅ 에러

  const { user, isLoading } = useAuthStore();
  const displayName = isLoading ? "로딩중..." : user?.name || "사용자";

  // ✅ 서버에서 가져온 type 목록으로 드롭다운 구성
  const searchCategories = useMemo(() => {
    const types = Array.from(
      new Set(allData.map((r) => r.type).filter(Boolean))
    );
    return [
      { value: "all", label: "전체" },
      ...types.map((t) => ({ value: t, label: t })),
    ];
  }, [allData]);

  const [searchCategory, setSearchCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]); // (옵션) 모달 다중선택

  // ✅ 서버 호출
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const list = await fetchGovResults();
        if (!ignore) setAllData(list);
      } catch (e) {
        if (!ignore) setError(e?.message || "목록을 불러오지 못했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // ✅ 필터링
  const filteredData = useMemo(() => {
    let rows = allData;

    // 1) 카테고리 단일 선택
    if (searchCategory !== "all") {
      rows = rows.filter((r) => r.type === searchCategory);
    }

    // 2) 다중 유형(선택 사용)
    if (selectedTypes.length > 0) {
      rows = rows.filter((r) => selectedTypes.includes(r.type));
    }

    // 3) 날짜 범위
    const toDate = (d, t = "00:00") => (d ? new Date(`${d}T${t}`) : null);
    const start = startDate ? toDate(startDate, "00:00") : null;
    const end = endDate ? toDate(endDate, "23:59") : null;
    if (start || end) {
      rows = rows.filter((r) => {
        const dt = toDate(r.date, r.time || "00:00");
        if (!dt) return false;
        if (start && dt < start) return false;
        if (end && dt > end) return false;
        return true;
      });
    }

    // 4) 검색어 (유형/내용 부분일치)
    if (searchTerm.trim()) {
      const term = searchTerm.trim();
      rows = rows.filter(
        (r) => r.type.includes(term) || r.administrator.includes(term)
      );
    }

    return rows;
  }, [allData, searchCategory, selectedTypes, searchTerm, startDate, endDate]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // 선택
  const handleSelectAll = () => {
    if (selectedRecords.length === currentData.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(currentData.map((r) => r.id));
    }
  };
  const handleSelectRecord = (id) => {
    setSelectedRecords((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSearch = () => {
    // 의도적으로 필터링은 useMemo가 처리 — 페이지를 1페이지로
    setCurrentPage(1);
  };

  const getCategoryLabel = () => {
    const found = searchCategories.find((c) => c.value === searchCategory);
    return found ? found.label : "전체";
  };

  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsDropdownOpen(false);
    };
    if (isDropdownOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const handleRowDownload = async (reportid, hasAttachment) => {
    if (!hasAttachment) return alert("파일 없음.");
    try {
      await downloadGovReport(reportid); // 토큰 헤더 포함해서 GET 다운로드
    } catch (e) {
      alert(e?.message || "다운로드 실패");
    }
  };

  // ✅ 선택 항목 일괄 다운로드 (전체 필터 결과 기준)
  const handleDownload = async () => {
    if (selectedRecords.length === 0) {
      alert("다운로드할 항목을 선택하세요.");
      return;
    }

    // 선택된 항목들만 (첨부 있는 것만 우선)
    const targets = filteredData.filter((r) => selectedRecords.includes(r.id));

    if (targets.length === 0) {
      alert("선택된 항목이 없습니다.");
      return;
    }

    let ok = 0,
      none = 0,
      fail = 0;

    for (const r of targets) {
      if (!r.hasAttachment) {
        none++;
        continue;
      }
      try {
        // 🔐 토큰 포함 다운로드 함수 사용 (탭 난사 방지)
        await downloadGovReport(r.id);
        ok++;
      } catch (e) {
        console.error("다운로드 실패:", r.id, e);
        fail++;
      }
    }

    const msgs = [];
    if (ok) msgs.push(`${ok}건 다운로드 시작`);
    if (none) msgs.push(`${none}건은 파일 없음`);
    if (fail) msgs.push(`${fail}건 실패`);
    if (msgs.length) alert(msgs.join("\n"));
  };

  return (
    <MainLayout>
      <S.Container>
        <S.Content>
          <S.Header>
            <S.WelcomeTitle>안녕하세요, {displayName}님</S.WelcomeTitle>
            <S.Subtitle>AI 민원실의 업무 기록을 확인하세요</S.Subtitle>
          </S.Header>

          <S.FilterSection>
            <S.DateRangeContainer>
              <S.DateInputWrapper>
                <S.DateInput
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || undefined}
                />
              </S.DateInputWrapper>
              <S.ArrowIcon>⇄</S.ArrowIcon>
              <S.DateInputWrapper>
                <S.DateInput
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                />
              </S.DateInputWrapper>
              <S.SearchButton onClick={handleSearch}>조회</S.SearchButton>
            </S.DateRangeContainer>

            <S.SearchContainer>
              {/* 왼쪽: 검색 컨트롤 묶음 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flex: 1,
                  minWidth: 420,
                }}
              >
                <S.SearchDropdown ref={dropdownRef}>
                  <S.DropdownButton
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {getCategoryLabel()}
                    <S.DropdownIcon $isOpen={isDropdownOpen}>▼</S.DropdownIcon>
                  </S.DropdownButton>
                  {isDropdownOpen && (
                    <S.DropdownMenu>
                      {searchCategories.map((c) => (
                        <S.DropdownItem
                          key={c.value}
                          onClick={() => {
                            setSearchCategory(c.value);
                            setIsDropdownOpen(false);
                            setSelectedTypes([]);
                            setCurrentPage(1);
                          }}
                        >
                          {c.label}
                        </S.DropdownItem>
                      ))}
                    </S.DropdownMenu>
                  )}
                </S.SearchDropdown>

                <S.SearchInput
                  type="text"
                  placeholder="검색어"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <S.SearchIconButton onClick={handleSearch}>
                  🔍
                </S.SearchIconButton>
              </div>
            </S.SearchContainer>
          </S.FilterSection>
          <S.DownloadBar>
            <div
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "flex-start",
              }}
            >
              <S.DownloadButton
                onClick={handleDownload}
                title="선택한 항목의 첨부파일을 내려받습니다"
                aria-label="선택 항목 내려받기"
                disabled={selectedRecords.length === 0}
              >
                내려받기
                {selectedRecords.length > 0
                  ? ` (${selectedRecords.length})`
                  : ""}
              </S.DownloadButton>

              {/* 버튼 우측 상단에 ? 아이콘 */}
              <S.HelpWrap>
                <S.HelpIcon tabIndex={0} aria-describedby="download-help">
                  ?
                </S.HelpIcon>
                <S.HelpTooltip id="download-help" role="tooltip">
                  체크박스로 선택한 파일을 한 번에 내려받을 수 있습니다
                </S.HelpTooltip>
              </S.HelpWrap>
            </div>
          </S.DownloadBar>

          {/* 로딩/에러 */}
          {loading ? (
            <S.TableContainer>
              <div style={{ padding: "2rem" }}>불러오는 중…</div>
            </S.TableContainer>
          ) : error ? (
            <S.TableContainer>
              <div style={{ padding: "2rem", color: "#c00" }}>{error}</div>
            </S.TableContainer>
          ) : (
            <>
              <S.TableContainer>
                <S.Table>
                  <S.TableHeader>
                    <S.TableHeaderRow>
                      <S.TableHeaderCell>
                        <S.Checkbox
                          type="checkbox"
                          checked={
                            selectedRecords.length === currentData.length &&
                            currentData.length > 0
                          }
                          onChange={handleSelectAll}
                        />
                      </S.TableHeaderCell>
                      <S.TableHeaderCell>신청일자</S.TableHeaderCell>
                      <S.TableHeaderCell>신청시각</S.TableHeaderCell>
                      <S.TableHeaderCell>민원 유형</S.TableHeaderCell>
                      <S.TableHeaderCell>신청인</S.TableHeaderCell>
                      <S.TableHeaderCell>첨부파일</S.TableHeaderCell>
                    </S.TableHeaderRow>
                  </S.TableHeader>
                  <S.TableBody>
                    {currentData.length > 0 ? (
                      currentData.map((r) => (
                        <S.TableRow key={r.id}>
                          <S.TableCell>
                            <S.Checkbox
                              type="checkbox"
                              checked={selectedRecords.includes(r.id)}
                              onChange={() => handleSelectRecord(r.id)}
                            />
                          </S.TableCell>
                          <S.TableCell>{r.date}</S.TableCell>
                          <S.TableCell>{r.time}</S.TableCell>
                          <S.TableCell>{r.type}</S.TableCell>
                          <S.TableCell>{r.administrator}</S.TableCell>
                          <S.TableCell>
                            {/* 공통 고정 높이 래퍼 */}
                            <div
                              style={{
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {r.hasAttachment ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRowDownload(r.id, r.hasAttachment)
                                  }
                                  title="파일 다운로드"
                                  style={{
                                    all: "unset",
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "4px",
                                    minWidth: "96px",
                                    height: "56px",
                                    color: "#333",
                                    font: "inherit",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "1.6rem",
                                      lineHeight: 1,
                                    }}
                                  >
                                    📄
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "0.85rem",
                                      lineHeight: 1.1,
                                    }}
                                  >
                                    다운로드
                                  </span>
                                </button>
                              ) : (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "4px",
                                    minWidth: "96px",
                                    height: "56px",
                                    color: "#999",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "0.95rem",
                                      lineHeight: 1.1,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    파일 없음
                                  </span>
                                </div>
                              )}
                            </div>
                          </S.TableCell>
                        </S.TableRow>
                      ))
                    ) : (
                      <S.TableRow>
                        <S.TableCell colSpan="6">
                          <S.NoDataMessage>
                            검색 결과가 없습니다.
                          </S.NoDataMessage>
                        </S.TableCell>
                      </S.TableRow>
                    )}
                  </S.TableBody>
                </S.Table>
              </S.TableContainer>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}

          <SearchTypeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={setSelectedTypes}
            initialSelectedTypes={selectedTypes}
          />
        </S.Content>
      </S.Container>
    </MainLayout>
  );
};

export default WorkRecords;
