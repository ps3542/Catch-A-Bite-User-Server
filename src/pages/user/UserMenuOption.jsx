import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiArrowLeft, HiMinus, HiPlus, HiCheck } from "react-icons/hi";
import { appUserStoreService } from "../../api/appuser/StoreService";

export default function UserMenuOption() {
  const { menuId } = useParams();
  const navigate = useNavigate();

  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({}); // { groupId: [optionId, ...] }

  useEffect(() => {
    loadMenu();
  }, [menuId]);

  const loadMenu = async () => {
    try {
      const data = await appUserStoreService.getMenuDetail(menuId);
      setMenu(data);
    } catch (error) {
      alert("메뉴 정보를 불러오는데 실패했습니다.");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (groupId, optionId) => {
    setSelectedOptions(prev => {
      const current = prev[groupId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter(id => id !== optionId) };
      } else {
        return { ...prev, [groupId]: [...current, optionId] };
      }
    });
  };

  const calculateTotalPrice = () => {
    if (!menu) return 0;
    let total = menu.menuPrice;
    
    // Add price of selected options
    menu.optionGroups?.forEach(group => {
      const selectedIds = selectedOptions[group.menuOptionGroupId] || [];
      group.options.forEach(opt => {
        if (selectedIds.includes(opt.menuOptionId)) {
          total += opt.menuOptionPrice;
        }
      });
    });
    
    return total * quantity;
  };

  const isFormValid = () => {
    if (!menu) return false;
    // Check required groups
    for (const group of menu.optionGroups) {
      if (group.required) {
        const selected = selectedOptions[group.menuOptionGroupId];
        if (!selected || selected.length === 0) return false;
      }
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!isFormValid()) return;
    
    // Logic to add to cart (localStorage or API)
    // For now, just alert and go back
    console.log("Add to cart:", {
        menuId: menu.menuId,
        quantity,
        options: selectedOptions
    });
    alert("장바구니에 담았습니다!");
    navigate(-1);
  };

  if (loading) return <div className="flex justify-center p-10">Loading...</div>;
  if (!menu) return null;

  return (
    <div className="bg-white min-h-screen pb-24 relative">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 border-b p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4"><HiArrowLeft size={24}/></button>
        <h1 className="font-bold text-lg">{menu.menuName}</h1>
      </div>

      {/* Info */}
      <div className="p-4">
          <h2 className="text-2xl font-bold mb-2">{menu.menuName}</h2>
          <p className="text-gray-500 mb-4">{menu.menuDescription}</p>
          <p className="text-xl font-bold">{menu.menuPrice.toLocaleString()}원</p>
      </div>
      <div className="h-2 bg-gray-100"></div>

      {/* Options */}
      <div className="p-4 space-y-6">
        {menu.optionGroups?.map(group => (
            <div key={group.menuOptionGroupId}>
                <h3 className="font-bold text-lg mb-3">
                    {group.menuOptionGroupName} 
                    {group.required && <span className="text-blue-500 text-sm ml-2">(필수)</span>}
                </h3>
                <div className="space-y-2">
                    {group.options.map(opt => {
                        const isSelected = selectedOptions[group.menuOptionGroupId]?.includes(opt.menuOptionId);
                        return (
                            <div key={opt.menuOptionId} 
                                 onClick={() => toggleOption(group.menuOptionGroupId, opt.menuOptionId)}
                                 className={`flex justify-between p-3 border rounded cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                            >
                                <div className="flex items-center gap-2">
                                    {isSelected && <HiCheck className="text-blue-500"/>}
                                    <span>{opt.menuOptionName}</span>
                                </div>
                                <span>+{opt.menuOptionPrice.toLocaleString()}원</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        ))}
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 w-full bg-white border-t p-4 shadow-lg">
          <div className="flex justify-between items-center mb-4">
              <span className="font-bold">수량</span>
              <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 bg-gray-100 rounded"><HiMinus/></button>
                  <span className="font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 bg-gray-100 rounded"><HiPlus/></button>
              </div>
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={!isFormValid()}
            className={`w-full py-3 rounded-lg font-bold text-white ${isFormValid() ? 'bg-green-600' : 'bg-gray-300'}`}
          >
            {calculateTotalPrice().toLocaleString()}원 담기
          </button>
      </div>
    </div>
  );
}