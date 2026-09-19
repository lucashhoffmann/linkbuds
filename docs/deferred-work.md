- source_spec: `docs/spec-link-editor-responsive-modal.md`
  summary: Complete the in-progress Select-to-combobox migration so popovers layer correctly in dialogs and retain the native Select contract.
  evidence: The pre-existing custom combobox renders its popover below dialog overlays and drops several native Select behaviors; the link modal uses native selects until this migration is resolved.
