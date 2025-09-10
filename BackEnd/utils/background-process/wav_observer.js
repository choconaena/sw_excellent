// directoryWatcher.js
const fs = require('fs');
const path = require('path');

/**
 * 특정 디렉터리를 감시하고, 새 파일이 생성되면 콜백을 호출하는 함수.
 *
 * @param {string} dirPath - 감시할 디렉터리 경로
 * @param {function} onNewFile - 새 파일이 생성되었을 때 호출될 콜백 (매개변수: 파일 경로)
 * @returns {object} - 감시를 중단할 수 있는 close 메서드를 가진 객체
 */
function watchDirectoryWav(dirPath, onNewFile) {
  // fs.watch를 통해 디렉터리 감시
  const watcher = fs.watch(dirPath, (eventType, filename) => {
    // rename 이벤트가 감지되면, 새 파일인지 여부를 확인
    if (eventType === 'rename' && filename) {
      const filePath = path.join(dirPath, filename);
      console.log(filePath)

      fs.stat(filePath, (err, stats) => {
        // 에러가 없고, 실제 파일이라면 (새로 생성된 파일일 가능성이 큼)
        if (!err && stats.isFile()) {
          // 새 파일이므로 콜백 실행
          onNewFile(filePath);
        }
      });
    }
  });

  return {
    /**
     * 감시를 중단하는 함수
     */
    close() {
      watcher.close();
    }
  };
}

// 모듈로 내보내기
module.exports = {
    watchDirectoryWav
};
