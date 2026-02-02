import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserProfileEdit.css";

export default function UserProfileEdit() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다");
      return;
    }

    // TODO: API 연동
    console.log("변경 정보:", { email, password });

    alert("정보가 수정되었습니다");
    navigate("../profile");
  };

  return (
    <div className="edit-container">
      <h2 className="edit-title">개인정보 수정</h2>

      <form className="edit-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 입력"
            required
          />
        </div>

        <div className="form-group">
          <label>새 비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="새 비밀번호"
            required
          />
        </div>

        <div className="form-group">
          <label>비밀번호 확인</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호 확인"
            required
          />
        </div>

        <button type="submit" className="save-btn">
          저장하기
        </button>
      </form>
    </div>
  );
}
