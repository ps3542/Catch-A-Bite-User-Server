import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ownerMenuService } from "../../../api/owner/ownerMenuService.js";
import { ownerMenuOptionService } from "../../../api/owner/ownerMenuOptionService.js";
import { unwrap } from "../../../utils/apiResponse.js";
import pageStyles from "../../../styles/ownerMenu.module.css";
import formStyles from "../../../styles/ownerForm.module.css";

export default function OwnerMenuOptionPage() {
  const { storeId } = useParams();
  const sid = useMemo(() => Number(storeId), [storeId]);
  const navigate = useNavigate();

  const [menus, setMenus] = useState([]);
  const [menuId, setMenuId] = useState("");
  const selectedMenuId = useMemo(() => (menuId ? Number(menuId) : null), [menuId]);

  const [groups, setGroups] = useState([]);
  const [optionsByGroup, setOptionsByGroup] = useState({});

  const [loadingMenus, setLoadingMenus] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [groupForm, setGroupForm] = useState({ menuOptionGroupName: "", required: false });

  const loadMenus = async () => {
    setLoadingMenus(true);
    try {
      const res = await ownerMenuService.getMenus(sid);
      setMenus(unwrap(res) ?? []);
    } finally {
      setLoadingMenus(false);
    }
  };

  const loadGroups = async (mid) => {
    if (!mid) return;
    setLoadingGroups(true);
    try {
      const res = await ownerMenuOptionService.listGroups(mid);
      const data = unwrap(res) ?? [];
      setGroups(data);

      const nextMap = {};
      for (const g of data) {
        const gid = g.menuOptionGroupId;
        try {
          const ores = await ownerMenuOptionService.listOptions(mid, gid);
          nextMap[gid] = unwrap(ores) ?? [];
        } catch {
          nextMap[gid] = [];
        }
      }
      setOptionsByGroup(nextMap);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(sid) || sid <= 0) return;
    loadMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid]);

  useEffect(() => {
    if (!selectedMenuId) {
      setGroups([]);
      setOptionsByGroup({});
      return;
    }
    loadGroups(selectedMenuId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMenuId]);

  const onCreateGroup = async () => {
    if (!selectedMenuId) return;
    if (!groupForm.menuOptionGroupName.trim()) return;

    await ownerMenuOptionService.createGroup(selectedMenuId, {
      menuOptionGroupName: groupForm.menuOptionGroupName.trim(),
      required: !!groupForm.required,
    });
    setGroupForm({ menuOptionGroupName: "", required: false });
    await loadGroups(selectedMenuId);
  };

  const onUpdateGroup = async (g, patch) => {
    if (!selectedMenuId) return;
    await ownerMenuOptionService.updateGroup(selectedMenuId, g.menuOptionGroupId, {
      menuOptionGroupName: patch.menuOptionGroupName ?? g.menuOptionGroupName,
      required: typeof patch.required === "boolean" ? patch.required : g.required,
    });
    await loadGroups(selectedMenuId);
  };

  const onDeleteGroup = async (g) => {
    if (!selectedMenuId) return;
    if (!confirm("옵션 그룹을 삭제하면 하위 옵션도 함께 정리됩니다. 삭제하시겠습니까?")) return;
    await ownerMenuOptionService.deleteGroup(selectedMenuId, g.menuOptionGroupId);
    await loadGroups(selectedMenuId);
  };

  const onCreateOption = async (g, payload) => {
    if (!selectedMenuId) return;
    const name = (payload.menuOptionName ?? "").trim();
    if (!name) return;
    const price = Number(payload.menuOptionPrice);
    await ownerMenuOptionService.createOption(selectedMenuId, g.menuOptionGroupId, {
      menuOptionName: name,
      menuOptionPrice: Number.isFinite(price) ? price : 0,
    });
    await loadGroups(selectedMenuId);
  };

  const onUpdateOption = async (g, opt, patch) => {
    if (!selectedMenuId) return;
    const nextName = (patch.menuOptionName ?? opt.menuOptionName ?? "").trim();
    const nextPrice = Number(patch.menuOptionPrice ?? opt.menuOptionPrice ?? 0);

    await ownerMenuOptionService.updateOption(selectedMenuId, g.menuOptionGroupId, opt.menuOptionId, {
      menuOptionName: nextName,
      menuOptionPrice: Number.isFinite(nextPrice) ? nextPrice : 0,
    });
    await loadGroups(selectedMenuId);
  };

  const onDeleteOption = async (g, opt) => {
    if (!selectedMenuId) return;
    if (!confirm("옵션을 삭제하시겠습니까?")) return;
    await ownerMenuOptionService.deleteOption(selectedMenuId, g.menuOptionGroupId, opt.menuOptionId);
    await loadGroups(selectedMenuId);
  };

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.headerRow}>
        <h2 className={pageStyles.title}>옵션 관리</h2>
        <button type="button" className={pageStyles.primaryBtn} onClick={() => navigate(-1)}>
          뒤로
        </button>
      </div>

      <div>
        <div className={formStyles.section}>
          <div className={formStyles.wrap}>
            <div>
              <div className={formStyles.label}>메뉴 선택</div>
              <select
                className={formStyles.input}
                value={menuId}
                onChange={(e) => setMenuId(e.target.value)}
                disabled={loadingMenus}
              >
                <option value="">메뉴를 선택하세요</option>
                {menus.map((m) => (
                  <option key={m.menuId} value={m.menuId}>
                    {m.menuName}
                  </option>
                ))}
              </select>
            </div>

            <div className={formStyles.headerActions} style={{ justifyContent: "flex-end" }}>
              <button
                type="button"
                className={formStyles.outlineBtn}
                onClick={() => navigate(`/owner/stores/${sid}/menus`)}
              >
                메뉴 목록으로
              </button>
            </div>
          </div>

          {!selectedMenuId && (
            <div className={pageStyles.muted}>
              옵션 그룹/옵션은 <b>메뉴 단위</b>로 관리됩니다. 먼저 메뉴를 선택해 주세요.
            </div>
          )}
        </div>
      </div>

      {selectedMenuId && (
        <>
          <div>
            <div className={formStyles.section}>
              <div className={formStyles.sectionTitle}>옵션 그룹 추가</div>

              <div className={formStyles.wrap}>
                <div>
                  <div className={formStyles.label}>옵션 그룹명</div>
                  <input
                    className={formStyles.input}
                    value={groupForm.menuOptionGroupName}
                    onChange={(e) => setGroupForm((p) => ({ ...p, menuOptionGroupName: e.target.value }))}
                    placeholder="예) 사이즈 선택"
                  />
                </div>

                <div>
                  <div className={formStyles.label}>필수 여부</div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={!!groupForm.required}
                      onChange={(e) => setGroupForm((p) => ({ ...p, required: e.target.checked }))}
                    />
                    <span>필수 선택</span>
                  </label>
                </div>

                <div className={formStyles.headerActions} style={{ justifyContent: "flex-end" }}>
                  <button type="button" className={formStyles.primaryBtn} onClick={onCreateGroup}>
                    추가
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className={formStyles.section}>
              <div className={formStyles.sectionTitle}>옵션 그룹 목록</div>

              {loadingGroups && <div className={pageStyles.muted}>불러오는 중...</div>}

              {!loadingGroups && groups.length === 0 && (
                <div className={pageStyles.muted}>등록된 옵션 그룹이 없습니다.</div>
              )}

              {!loadingGroups &&
                groups.map((g) => (
                  <GroupBlock
                    key={g.menuOptionGroupId}
                    group={g}
                    options={optionsByGroup[g.menuOptionGroupId] ?? []}
                    onUpdateGroup={(patch) => onUpdateGroup(g, patch)}
                    onDeleteGroup={() => onDeleteGroup(g)}
                    onCreateOption={(payload) => onCreateOption(g, payload)}
                    onUpdateOption={(opt, patch) => onUpdateOption(g, opt, patch)}
                    onDeleteOption={(opt) => onDeleteOption(g, opt)}
                  />
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function GroupBlock({
  group,
  options,
  onUpdateGroup,
  onDeleteGroup,
  onCreateOption,
  onUpdateOption,
  onDeleteOption,
}) {
  const [editName, setEditName] = useState(group.menuOptionGroupName ?? "");
  const [editRequired, setEditRequired] = useState(!!group.required);

  const [newOpt, setNewOpt] = useState({ menuOptionName: "", menuOptionPrice: 0 });

  useEffect(() => {
    setEditName(group.menuOptionGroupName ?? "");
    setEditRequired(!!group.required);
  }, [group.menuOptionGroupId, group.menuOptionGroupName, group.required]);

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, marginTop: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div className={formStyles.label}>그룹명</div>
          <input className={formStyles.input} value={editName} onChange={(e) => setEditName(e.target.value)} />
        </div>

        <div style={{ minWidth: 160 }}>
          <div className={formStyles.label}>필수</div>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={editRequired} onChange={(e) => setEditRequired(e.target.checked)} />
            <span>필수 선택</span>
          </label>
        </div>

        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <button
            type="button"
            className={formStyles.outlineBtn}
            onClick={() => onUpdateGroup({ menuOptionGroupName: editName.trim(), required: editRequired })}
          >
            저장
          </button>
          <button type="button" className={formStyles.dangerBtn} onClick={onDeleteGroup}>
            삭제
          </button>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          className={formStyles.input}
          placeholder="옵션명 (예: L)"
          value={newOpt.menuOptionName}
          onChange={(e) => setNewOpt((p) => ({ ...p, menuOptionName: e.target.value }))}
          style={{ flex: 1, minWidth: 220 }}
        />
        <input
          className={formStyles.input}
          type="number"
          placeholder="가격"
          value={newOpt.menuOptionPrice}
          onChange={(e) => setNewOpt((p) => ({ ...p, menuOptionPrice: e.target.value }))}
          style={{ width: 140 }}
        />
        <button
          type="button"
          className={formStyles.primaryBtn}
          onClick={() => {
            onCreateOption(newOpt);
            setNewOpt({ menuOptionName: "", menuOptionPrice: 0 });
          }}
        >
          옵션 추가
        </button>
      </div>

      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {options.length === 0 && <div className={pageStyles.muted}>옵션이 없습니다.</div>}
        {options.map((opt) => (
          <OptionRow
            key={opt.menuOptionId}
            opt={opt}
            onSave={(patch) => onUpdateOption(opt, patch)}
            onDelete={() => onDeleteOption(opt)}
          />
        ))}
      </div>
    </div>
  );
}

function OptionRow({ opt, onSave, onDelete }) {
  const [name, setName] = useState(opt.menuOptionName ?? "");
  const [price, setPrice] = useState(opt.menuOptionPrice ?? 0);

  useEffect(() => {
    setName(opt.menuOptionName ?? "");
    setPrice(opt.menuOptionPrice ?? 0);
  }, [opt.menuOptionId, opt.menuOptionName, opt.menuOptionPrice]);

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div className={formStyles.label}>옵션명</div>
        <input className={formStyles.input} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div style={{ width: 140 }}>
        <div className={formStyles.label}>가격</div>
        <input className={formStyles.input} type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>

      <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
        <button type="button" className={formStyles.outlineBtn} onClick={() => onSave({ menuOptionName: name, menuOptionPrice: price })}>
          저장
        </button>
        <button type="button" className={formStyles.dangerBtn} onClick={onDelete}>
          삭제
        </button>
      </div>
    </div>
  );
}
