const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = null;
        this.init();
    }

    init() {
        const dbPath = path.join(__dirname, '..', 'data', 'students.db');
        
        // data 디렉토리가 없으면 생성
        const fs = require('fs');
        const dataDir = path.dirname(dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('데이터베이스 연결 실패:', err.message);
            } else {
                console.log('✅ SQLite 데이터베이스 연결됨');
                this.createTables();
            }
        });
    }

    createTables() {
        const createStudentsTable = `
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        this.db.run(createStudentsTable, (err) => {
            if (err) {
                console.error('테이블 생성 실패:', err.message);
            } else {
                console.log('✅ students 테이블 생성 완료');
                // 테이블 생성 후 샘플 데이터 추가
                setTimeout(() => {
  
                }, 100);
            }
        });
    }

    // 학번으로 학생 정보 조회
    getStudentById(studentId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM students WHERE student_id = ?',
                [studentId],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    // 모든 학생 목록 조회 (관리자용)
    getAllStudents() {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM students ORDER BY student_id',
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    // 새 학생 추가 (관리자용)
    addStudent(studentId, name) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO students (student_id, name) VALUES (?, ?)',
                [studentId, name],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, student_id: studentId, name: name });
                    }
                }
            );
        });
    }

    // 학생 정보 삭제 (관리자용)
    deleteStudent(studentId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM students WHERE student_id = ?',
                [studentId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes > 0);
                    }
                }
            );
        });
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('데이터베이스 종료 실패:', err.message);
                } else {
                    console.log('✅ 데이터베이스 연결 종료됨');
                }
            });
        }
    }
}

module.exports = Database;
