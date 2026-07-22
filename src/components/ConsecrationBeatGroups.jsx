import { useMemo, useState } from 'react';

const NO_STYLE_GROUP_NAME = 'Play without styles';
const LEGACY_NO_STYLE_GROUP_NAME = 'Play without beats/styles';

function isNoStyleGroup(groupOrForm = {}) {
  return groupOrForm.group_type === 'no_style'
    || groupOrForm.beat_name === NO_STYLE_GROUP_NAME
    || groupOrForm.beat_name === LEGACY_NO_STYLE_GROUP_NAME;
}

function normalizeSongName(value) {
  return String(value || '').replace(/^♪+/, '').trim();
}

function uniqueSongNames(songNames) {
  const seenNames = new Set();

  return songNames
    .map(normalizeSongName)
    .filter(Boolean)
    .filter(songName => {
      const normalizedName = songName.toLowerCase();
      if (seenNames.has(normalizedName)) return false;
      seenNames.add(normalizedName);
      return true;
    });
}

function parseStoredSongNames(value) {
  return uniqueSongNames(String(value || '').split(/\r?\n/));
}

function parseSeparatedSongNames(value, separator) {
  const text = String(value || '');

  if (separator === 'newline') return uniqueSongNames(text.split(/\r?\n/));
  if (separator === 'comma') return uniqueSongNames(text.split(','));
  if (separator === 'semicolon') return uniqueSongNames(text.split(';'));

  return uniqueSongNames([text.replace(/\s+/g, ' ')]);
}

function formatGroupSummary(group) {
  if (isNoStyleGroup(group)) return NO_STYLE_GROUP_NAME;

  const styleName = group.beat_name?.trim();
  const category = group.beat_category?.trim();

  return [
    styleName && category ? `${styleName} (${category})` : styleName || category,
    group.tempo ? `${group.tempo} BPM` : null,
    group.musical_key ? `Key ${group.musical_key}` : null,
    group.variation?.trim()
  ].filter(Boolean).join(' | ');
}

function ordinalSuffix(day) {
  if (day % 100 >= 11 && day % 100 <= 13) return 'th';
  if (day % 10 === 1) return 'st';
  if (day % 10 === 2) return 'nd';
  if (day % 10 === 3) return 'rd';
  return 'th';
}

function formatDisplayDate(value) {
  if (!value) return '';

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  const day = date.getDate();
  return `${day}${ordinalSuffix(day)} of ${date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;
}

function getSubgroupSize(value) {
  return Math.max(1, Number(value) || 6);
}

function chunkSongs(songs = [], subgroupSize = 6) {
  const size = getSubgroupSize(subgroupSize);
  const chunks = [];

  for (let index = 0; index < songs.length; index += size) {
    chunks.push(songs.slice(index, index + size));
  }

  return chunks;
}

function normalizeOptionValue(value) {
  return String(value || '').trim().toLowerCase();
}

function getMappedOptions(mapping, key) {
  return mapping?.[normalizeOptionValue(key)] || [];
}

function getAutoCategoryForStyle(beatCategoryMap, styleName) {
  return getMappedOptions(beatCategoryMap?.beatToCategories, styleName)[0] || '';
}

function getStyleOptionsForCategory(beatCategoryMap, categoryName, fallbackOptions) {
  const mappedOptions = getMappedOptions(beatCategoryMap?.categoryToBeats, categoryName);
  return mappedOptions.length > 0 ? mappedOptions : fallbackOptions;
}

function groupToFormData(group) {
  return {
    group_type: isNoStyleGroup(group) ? 'no_style' : 'style',
    beat_category: isNoStyleGroup(group) ? '' : group.beat_category || '',
    beat_name: isNoStyleGroup(group) ? '' : group.beat_name || '',
    tempo: isNoStyleGroup(group) ? '' : group.tempo || '',
    musical_key: isNoStyleGroup(group) ? '' : group.musical_key || '',
    variation: isNoStyleGroup(group) ? '' : group.variation || '',
    song_names: (group.songs || []).map(song => song.song_name).join('\n'),
    song_separator: 'newline',
    is_highlighted: Boolean(group.is_highlighted),
    due_date: group.due_date || '',
    subgroup_size: group.subgroup_size || 6,
    highlighted_subgroup_index: group.highlighted_subgroup_index || ''
  };
}

function ConsecrationGroupForm({
  formData,
  onFormChange,
  onSubmit,
  onCancel,
  saving,
  beatCategoryOptions,
  beatNameOptions,
  beatCategoryMap,
  mode = 'add'
}) {
  const [songNameInput, setSongNameInput] = useState('');
  const [draggedSongIndex, setDraggedSongIndex] = useState(null);
  const [dragTargetIndex, setDragTargetIndex] = useState(null);
  const [dragTargetGroupIndex, setDragTargetGroupIndex] = useState(null);
  const selectedSongNames = useMemo(
    () => parseStoredSongNames(formData.song_names),
    [formData.song_names]
  );
  const isNoStyle = formData.group_type === 'no_style';
  const filteredStyleNameOptions = getStyleOptionsForCategory(
    beatCategoryMap,
    formData.beat_category,
    beatNameOptions
  );
  const subgroupSize = getSubgroupSize(formData.subgroup_size);
  const selectedSongGroups = chunkSongs(selectedSongNames, subgroupSize);

  function setSongNames(songNames) {
    onFormChange?.({
      ...formData,
      song_names: songNames.join('\n')
    });
  }

  function addSongNames(value) {
    const nextNames = parseSeparatedSongNames(value, formData.song_separator);
    if (nextNames.length === 0) return;

    const existingNames = new Set(selectedSongNames.map(songName => songName.toLowerCase()));
    setSongNames([
      ...selectedSongNames,
      ...nextNames.filter(songName => !existingNames.has(songName.toLowerCase()))
    ]);
    setSongNameInput('');
  }

  function removeSongName(songNameToRemove) {
    setSongNames(selectedSongNames.filter(songName => songName !== songNameToRemove));
  }

  function moveSong(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= selectedSongNames.length || fromIndex === toIndex) return;

    const nextSongNames = [...selectedSongNames];
    const [songName] = nextSongNames.splice(fromIndex, 1);
    nextSongNames.splice(toIndex, 0, songName);
    setSongNames(nextSongNames);
  }

  function moveDraggedSong(fromIndex, toIndex) {
    if (fromIndex === null || toIndex === null) return;
    if (toIndex < 0 || toIndex > selectedSongNames.length || fromIndex === toIndex) return;

    const nextSongNames = [...selectedSongNames];
    const [songName] = nextSongNames.splice(fromIndex, 1);
    const adjustedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
    nextSongNames.splice(adjustedToIndex, 0, songName);
    setSongNames(nextSongNames);
  }

  function moveDraggedSongToGroupEnd(fromIndex, groupIndex) {
    if (fromIndex === null || groupIndex === null) return;

    const targetIndex = Math.min((groupIndex + 1) * subgroupSize, selectedSongNames.length);
    moveDraggedSong(fromIndex, targetIndex);
  }

  function clearDragState() {
    setDraggedSongIndex(null);
    setDragTargetIndex(null);
    setDragTargetGroupIndex(null);
  }

  return (
    <form
      className={[
        'consecration-form',
        mode === 'edit' ? 'consecration-form--edit' : 'app-work-form app-work-form--add'
      ].join(' ')}
      onSubmit={onSubmit}
    >
      {mode === 'edit' && (
        <div className="consecration-form__edit-banner">
          <span>Editing Group</span>
          <strong>{isNoStyle ? NO_STYLE_GROUP_NAME : formData.beat_name || 'New style group'}</strong>
        </div>
      )}

      {mode !== 'edit' && (
        <div className="app-work-form__banner">
          <span>Adding Group</span>
          <strong>New Consecration song group</strong>
        </div>
      )}

      <div className="form-grid">
        <div>
          <label>Group Type</label>
          <select
            value={formData.group_type || 'style'}
            onChange={event => onFormChange?.({
              ...formData,
              group_type: event.target.value,
              beat_category: event.target.value === 'no_style' ? '' : formData.beat_category,
              beat_name: event.target.value === 'no_style' ? '' : formData.beat_name,
              tempo: event.target.value === 'no_style' ? '' : formData.tempo,
              musical_key: event.target.value === 'no_style' ? '' : formData.musical_key,
              variation: event.target.value === 'no_style' ? '' : formData.variation
            })}
            autoFocus={mode === 'add'}
          >
            <option value="style">Style group</option>
            <option value="no_style">Play without styles</option>
          </select>
        </div>

        <div>
          <label>Due Date</label>
          <input
            type="date"
            value={formData.due_date || ''}
            onChange={event => onFormChange?.({ ...formData, due_date: event.target.value })}
          />
        </div>
      </div>

      <div className="form-grid">
        <div>
          <label>Songs Per Subgroup</label>
          <input
            type="number"
            min="1"
            max="20"
            value={formData.subgroup_size || 6}
            onChange={event => onFormChange?.({
              ...formData,
              subgroup_size: event.target.value,
              highlighted_subgroup_index: ''
            })}
          />
        </div>

        <div>
          <label>Highlighted Subgroup</label>
          <select
            value={formData.highlighted_subgroup_index || ''}
            onChange={event => onFormChange?.({
              ...formData,
              highlighted_subgroup_index: event.target.value,
              is_highlighted: event.target.value ? true : formData.is_highlighted
            })}
          >
            <option value="">None</option>
            {selectedSongGroups.map((_, index) => (
              <option key={index + 1} value={index + 1}>Subgroup {index + 1}</option>
            ))}
          </select>
        </div>
      </div>

      <label className="consecration-highlight-control">
        <input
          type="checkbox"
          checked={Boolean(formData.is_highlighted)}
          onChange={event => onFormChange?.({
            ...formData,
            is_highlighted: event.target.checked,
            highlighted_subgroup_index: event.target.checked ? formData.highlighted_subgroup_index : ''
          })}
        />
        Highlight this group as due
      </label>

      {!isNoStyle && (
        <>
          <div className="form-grid">
            <div>
              <label>Style Category</label>
              <input
                placeholder="e.g. Country, Ballad"
                value={formData.beat_category}
                onChange={event => onFormChange?.({ ...formData, beat_category: event.target.value })}
                list="consecration-style-category-options"
              />
              <datalist id="consecration-style-category-options">
                {beatCategoryOptions.map(category => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
            <div>
              <label>Keyboard Style *</label>
              <input
                placeholder="e.g. Waltz"
                value={formData.beat_name}
                onChange={event => {
                  const styleName = event.target.value;
                  const autoCategory = getAutoCategoryForStyle(beatCategoryMap, styleName);
                  onFormChange?.({
                    ...formData,
                    beat_name: styleName,
                    beat_category: autoCategory || formData.beat_category
                  });
                }}
                list="consecration-style-name-options"
                required
              />
              <datalist id="consecration-style-name-options">
                {filteredStyleNameOptions.map(styleName => (
                  <option key={styleName} value={styleName} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="form-grid">
            <div>
              <label>Tempo (BPM)</label>
              <input
                type="number"
                placeholder="e.g. 53"
                value={formData.tempo}
                onChange={event => onFormChange?.({ ...formData, tempo: event.target.value })}
              />
            </div>
            <div>
              <label>Key</label>
              <input
                placeholder="e.g. F"
                value={formData.musical_key || ''}
                onChange={event => onFormChange?.({ ...formData, musical_key: event.target.value })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div>
              <label>Variation</label>
              <input
                placeholder="e.g. Variation B&C"
                value={formData.variation}
                onChange={event => onFormChange?.({ ...formData, variation: event.target.value })}
              />
            </div>
          </div>
        </>
      )}

      {isNoStyle && (
        <div className="consecration-form__heading-preview">
          <label>Heading</label>
          <strong>{NO_STYLE_GROUP_NAME}</strong>
        </div>
      )}

      <div>
        {!isNoStyle && <label>Songs Under This Style *</label>}
        <div className="consecration-separator">
          <label>
            How are pasted songs separated?
            <select
              value={formData.song_separator || ''}
              onChange={event => onFormChange?.({ ...formData, song_separator: event.target.value })}
            >
              <option value="">Not separated / add one song</option>
              <option value="newline">New line</option>
              <option value="comma">Comma</option>
              <option value="semicolon">Semicolon</option>
            </select>
          </label>
        </div>
        <div className="consecration-song-picker">
          <input
            placeholder="Type or paste song names"
            value={songNameInput}
            onChange={event => setSongNameInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addSongNames(songNameInput);
              }
            }}
            onPaste={event => {
              const pastedText = event.clipboardData.getData('text');
              const pastedNames = parseSeparatedSongNames(pastedText, formData.song_separator);
              if (formData.song_separator && pastedNames.length > 1) {
                event.preventDefault();
                addSongNames(pastedText);
              }
            }}
          />
          <button type="button" onClick={() => addSongNames(songNameInput)} disabled={!songNameInput.trim()}>
            Add Song
          </button>
        </div>
        <span className="consecration-form__hint">Choose the separator before pasting many songs, or leave it as one song at a time.</span>

        {selectedSongGroups.length > 0 && (
          <div className="consecration-selected-subgroups">
            <span className="consecration-form__hint">
              Drag a song by the handle to reorder it or move it into another subgroup. Drop on a song to place it there, or drop inside a subgroup to move it to the end.
            </span>
            {selectedSongGroups.map((songGroup, groupIndex) => {
              const subgroupNumber = groupIndex + 1;
              const highlighted = Number(formData.highlighted_subgroup_index) === subgroupNumber;
              return (
                <section
                  key={subgroupNumber}
                  className={[
                    'consecration-selected-subgroup',
                    highlighted ? 'consecration-selected-subgroup--highlighted' : '',
                    dragTargetGroupIndex === groupIndex ? 'consecration-selected-subgroup--drop-target' : ''
                  ].filter(Boolean).join(' ')}
                  onDragOver={event => {
                    if (draggedSongIndex === null) return;
                    event.preventDefault();
                    setDragTargetIndex(null);
                    setDragTargetGroupIndex(groupIndex);
                  }}
                  onDragLeave={event => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setDragTargetGroupIndex(current => current === groupIndex ? null : current);
                    }
                  }}
                  onDrop={event => {
                    event.preventDefault();
                    moveDraggedSongToGroupEnd(draggedSongIndex, groupIndex);
                    clearDragState();
                  }}
                >
                  <div className="consecration-selected-subgroup__header">
                    <strong>Subgroup {subgroupNumber}</strong>
                    <button
                      type="button"
                      onClick={() => onFormChange?.({
                        ...formData,
                        is_highlighted: true,
                        highlighted_subgroup_index: highlighted ? '' : subgroupNumber
                      })}
                    >
                      {highlighted ? 'Unhighlight' : 'Highlight'}
                    </button>
                  </div>

                  <ol className="consecration-selected-songs">
                    {songGroup.map((songName, index) => {
                      const absoluteIndex = groupIndex * subgroupSize + index;
                      return (
                        <li
                          key={`${songName}-${absoluteIndex}`}
                          className={[
                            draggedSongIndex === absoluteIndex ? 'consecration-selected-songs__item--dragging' : '',
                            dragTargetIndex === absoluteIndex ? 'consecration-selected-songs__item--drop-target' : ''
                          ].filter(Boolean).join(' ')}
                          draggable
                          onDragStart={event => {
                            setDraggedSongIndex(absoluteIndex);
                            event.dataTransfer.effectAllowed = 'move';
                            event.dataTransfer.setData('text/plain', String(absoluteIndex));
                          }}
                          onDragOver={event => {
                            event.preventDefault();
                            event.stopPropagation();
                            setDragTargetIndex(absoluteIndex);
                            setDragTargetGroupIndex(null);
                          }}
                          onDrop={event => {
                            event.preventDefault();
                            event.stopPropagation();
                            moveDraggedSong(draggedSongIndex, absoluteIndex);
                            clearDragState();
                          }}
                          onDragEnd={clearDragState}
                        >
                          <span className="consecration-selected-songs__drag-handle" aria-hidden="true">⋮⋮</span>
                          <span>{songName}</span>
                          <div className="consecration-selected-songs__actions">
                            <button type="button" onClick={() => moveSong(absoluteIndex, Math.max(0, absoluteIndex - subgroupSize))} disabled={groupIndex === 0}>
                              Prev
                            </button>
                            <button type="button" onClick={() => moveSong(absoluteIndex, Math.min(selectedSongNames.length - 1, absoluteIndex + subgroupSize))} disabled={groupIndex === selectedSongGroups.length - 1}>
                              Next
                            </button>
                            <button type="button" onClick={() => removeSongName(songName)} aria-label={`Remove ${songName}`}>
                              Remove
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <div className="consecration-form__actions">
        <button type="submit" className="consecration-form__save" disabled={saving}>
          {saving ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Save Group'}
        </button>
        <button type="button" className="consecration-form__cancel" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function ConsecrationBeatGroups({
  groups = [],
  formData,
  onFormChange,
  onSaveGroup,
  onUpdateGroup,
  saving = false,
  canAdd = false,
  canEdit = false,
  beatCategoryOptions = [],
  beatNameOptions = [],
  beatCategoryMap,
  autoCollapseSubgroups = true,
  onAutoCollapseSubgroupsChange
}) {
  const [showForm, setShowForm] = useState(false);
  const [openGroupIds, setOpenGroupIds] = useState(() => new Set());
  const [manuallyOpenSubgroupKeys, setManuallyOpenSubgroupKeys] = useState(() => new Set());
  const [manuallyClosedSubgroupKeys, setManuallyClosedSubgroupKeys] = useState(() => new Set());
  const [dismissedAutoOpenGroupIds, setDismissedAutoOpenGroupIds] = useState(() => new Set());
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingFormData, setEditingFormData] = useState(null);
  const groupCountLabel = `${groups.length} group${groups.length === 1 ? '' : 's'}`;
  const songCount = useMemo(
    () => groups.reduce((count, group) => count + (group.songs?.length || 0), 0),
    [groups]
  );

  const highlightedAutoOpenGroupId = useMemo(() => {
    const highlightedGroup = groups.find(group => group.is_highlighted && group.highlighted_subgroup_index)
      || groups.find(group => group.is_highlighted);
    return highlightedGroup?.id || null;
  }, [groups]);

  const effectiveOpenGroupIds = useMemo(() => {
    if (openGroupIds.size > 0) return openGroupIds;
    if (highlightedAutoOpenGroupId && !dismissedAutoOpenGroupIds.has(highlightedAutoOpenGroupId)) {
      return new Set([highlightedAutoOpenGroupId]);
    }
    return openGroupIds;
  }, [openGroupIds, highlightedAutoOpenGroupId, dismissedAutoOpenGroupIds]);

  function clearSubgroupOverridesForGroup(groupId) {
    const groupKeyPrefix = `${groupId}:`;
    setManuallyOpenSubgroupKeys(openKeys => (
      new Set([...openKeys].filter(key => !key.startsWith(groupKeyPrefix)))
    ));
    setManuallyClosedSubgroupKeys(closedKeys => (
      new Set([...closedKeys].filter(key => !key.startsWith(groupKeyPrefix)))
    ));
  }

  function toggleGroup(groupId) {
    if (effectiveOpenGroupIds.has(groupId)) {
      setDismissedAutoOpenGroupIds(current => new Set([...current, groupId]));
      setOpenGroupIds(new Set());
      return;
    }

    setDismissedAutoOpenGroupIds(current => {
      const next = new Set(current);
      next.delete(groupId);
      return next;
    });
    clearSubgroupOverridesForGroup(groupId);
    setOpenGroupIds(new Set([groupId]));
  }

  async function submitGroup(event) {
    event.preventDefault();
    const saved = await onSaveGroup?.();
    if (saved) setShowForm(false);
  }

  async function submitEditGroup(event) {
    event.preventDefault();
    const saved = await onUpdateGroup?.(editingGroupId, editingFormData);
    if (saved) {
      setEditingGroupId(null);
      setEditingFormData(null);
    }
  }

  function startEditGroup(group) {
    setShowForm(false);
    setEditingGroupId(group.id);
    setEditingFormData(groupToFormData(group));
    setOpenGroupIds(new Set([group.id]));
  }

  function cancelEditGroup() {
    setEditingGroupId(null);
    setEditingFormData(null);
  }

  function isSubgroupCollapsed(subgroupKey, shouldAutoCollapse, forceOpen = false) {
    if (forceOpen) return false;
    if (manuallyOpenSubgroupKeys.has(subgroupKey)) return false;
    if (manuallyClosedSubgroupKeys.has(subgroupKey)) return true;
    return shouldAutoCollapse;
  }

  function toggleSubgroup(subgroupKey, currentlyCollapsed) {
    setManuallyOpenSubgroupKeys(current => {
      const next = new Set(current);
      if (currentlyCollapsed) {
        next.add(subgroupKey);
      } else {
        next.delete(subgroupKey);
      }
      return next;
    });

    setManuallyClosedSubgroupKeys(current => {
      const next = new Set(current);
      if (currentlyCollapsed) {
        next.delete(subgroupKey);
      } else {
        next.add(subgroupKey);
      }
      return next;
    });
  }

  function changeAutoCollapseSubgroups(enabled) {
    if (enabled) {
      setManuallyOpenSubgroupKeys(new Set());
      setManuallyClosedSubgroupKeys(new Set());
    }
    onAutoCollapseSubgroupsChange?.(enabled);
  }

  return (
    <section className="consecration-panel no-print" aria-labelledby="consecration-heading">
      <div className="consecration-panel__header">
        <div>
          <h2 id="consecration-heading">Consecration Songs</h2>
          <span className="consecration-panel__eyebrow">Song groups</span>
          <div className="consecration-panel__stats">
            <span>{groupCountLabel}</span>
            <span>{songCount} song{songCount === 1 ? '' : 's'}</span>
          </div>
        </div>

        {canAdd && (
          <button
            type="button"
            onClick={() => {
              setShowForm(current => !current);
              cancelEditGroup();
            }}
            className="consecration-panel__add"
          >
            {showForm ? 'Close' : 'Add Group'}
          </button>
        )}
      </div>

      <div className="consecration-display-settings">
        <label>
          <input
            type="checkbox"
            checked={Boolean(autoCollapseSubgroups)}
            onChange={event => changeAutoCollapseSubgroups(event.target.checked)}
          />
          Auto-collapse non-highlighted subgroups in highlighted groups
        </label>
      </div>

      {showForm && canAdd && (
        <ConsecrationGroupForm
          formData={formData}
          onFormChange={onFormChange}
          onSubmit={submitGroup}
          onCancel={() => setShowForm(false)}
          saving={saving}
          beatCategoryOptions={beatCategoryOptions}
          beatNameOptions={beatNameOptions}
          beatCategoryMap={beatCategoryMap}
        />
      )}

      <div className="consecration-groups">
        {groups.length === 0 ? (
          <p className="consecration-panel__empty">No Consecration groups saved yet.</p>
        ) : (
          groups.map(group => {
            const open = effectiveOpenGroupIds.has(group.id);
            const editing = editingGroupId === group.id;
            const highlighted = Boolean(group.is_highlighted);
            return (
              <article
                key={group.id}
                className={`consecration-group ${highlighted ? 'consecration-group--highlighted' : ''}`}
              >
                <div className="consecration-group__header">
                  <button
                    type="button"
                    className="consecration-group__toggle"
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={open}
                  >
                    <span aria-hidden="true">{isNoStyleGroup(group) ? '•' : '🎹'}</span>
                    <strong>{formatGroupSummary(group)}</strong>
                    <small>{group.songs?.length || 0} song{group.songs?.length === 1 ? '' : 's'}</small>
                  </button>

                  {canEdit && (
                    <button
                      type="button"
                      className="consecration-group__edit"
                      onClick={() => editing ? cancelEditGroup() : startEditGroup(group)}
                      disabled={saving}
                    >
                      {editing ? 'Close Edit' : 'Edit'}
                    </button>
                  )}
                </div>

                {highlighted && (
                  <div className="consecration-group__status">
                    Highlighted{group.due_date ? ` for ${formatDisplayDate(group.due_date)}` : ''}
                  </div>
                )}

                {editing && editingFormData && (
                  <ConsecrationGroupForm
                    formData={editingFormData}
                    onFormChange={setEditingFormData}
                    onSubmit={submitEditGroup}
                    onCancel={cancelEditGroup}
                    saving={saving}
                    beatCategoryOptions={beatCategoryOptions}
                    beatNameOptions={beatNameOptions}
                    beatCategoryMap={beatCategoryMap}
                    mode="edit"
                  />
                )}

                {open && !editing && (
                  <div className="consecration-group__subgroups">
                    {chunkSongs(group.songs || [], group.subgroup_size || 6).map((songGroup, index) => {
                      const subgroupNumber = index + 1;
                      const highlightedSubgroup = Number(group.highlighted_subgroup_index) === subgroupNumber;
                      const subgroupKey = `${group.id}:${subgroupNumber}`;
                      const shouldAutoCollapse = Boolean(
                        autoCollapseSubgroups
                        && group.is_highlighted
                        && group.highlighted_subgroup_index
                        && !highlightedSubgroup
                      );
                      const collapsed = isSubgroupCollapsed(subgroupKey, shouldAutoCollapse, highlightedSubgroup);
                      return (
                        <section
                          key={subgroupNumber}
                          className={`consecration-group__subgroup ${highlightedSubgroup ? 'consecration-group__subgroup--highlighted' : ''}`}
                        >
                          <div className="consecration-group__subgroup-header">
                            <strong>Subgroup {subgroupNumber}</strong>
                            {highlightedSubgroup && <span>Highlighted</span>}
                            <button
                              type="button"
                              onClick={() => toggleSubgroup(subgroupKey, collapsed)}
                            >
                              {collapsed ? 'Show' : 'Collapse'}
                            </button>
                          </div>
                          {!collapsed && (
                            <ol className="consecration-group__songs">
                              {songGroup.map(song => (
                                <li key={song.id}>{song.song_name}</li>
                              ))}
                            </ol>
                          )}
                        </section>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

export default ConsecrationBeatGroups;
