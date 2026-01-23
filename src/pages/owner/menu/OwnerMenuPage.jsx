import { useParams } from "react-router-dom";

const OwnerMenuPage = () => {
  const { storeId } = useParams();

  return (
    <div>
      <h2>메뉴 관리</h2>
      <div>storeId: {storeId}</div>
    </div>
  );
};

export default OwnerMenuPage;
