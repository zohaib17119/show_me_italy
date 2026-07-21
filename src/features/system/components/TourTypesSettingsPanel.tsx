import { useEffect, useState } from 'react';
import { Modal, Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import type { TourType } from '@/api/types';
import {
  buildTourTypeImagePayload,
  mapTourTypeImagesFromApi,
  type TourTypeImageItem,
} from '@/api/mappers/tourTypeImageMapper';
import {
  AppButton,
  AppCard,
  FormGrid,
  FormInput,
  FormTextarea,
  SettingsRow,
  SettingsRowMenu,
  ToggleSwitch,
  showToast,
} from '@/components/ui';
import {
  createTourType,
  deleteTourType,
  fetchTourTypes,
  selectTourTypeMutationStatus,
  selectTourTypes,
  updateTourType,
} from '@/features/tourType/tourTypeSlice';
import { TourTypeImagePicker } from './TourTypeImagePicker';
import styles from '../settings.module.css';

const emptyTourForm = (): Partial<TourType> => ({
  name: '',
  description: '',
  location: 'Rome',
  meetingPointName: '',
  meetingPointAddress: '',
  basePrice: 70,
  durationMinutes: 150,
  isActive: true,
});

export function TourTypesSettingsPanel() {
  const dispatch = useAppDispatch();
  const tourTypes = useAppSelector(selectTourTypes);
  const isSavingTourType = useAppSelector(selectTourTypeMutationStatus) === 'loading';

  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [tourForm, setTourForm] = useState<Partial<TourType>>(emptyTourForm());
  const [editingTourId, setEditingTourId] = useState<number | null>(null);
  const [tourTypeImages, setTourTypeImages] = useState<TourTypeImageItem[]>([]);

  useEffect(() => {
    void dispatch(fetchTourTypes());
  }, [dispatch]);

  const resetTourModal = () => {
    setTourForm(emptyTourForm());
    setTourTypeImages([]);
    setEditingTourId(null);
  };

  const closeTourModal = () => {
    if (isSavingTourType) return;
    setTourModalOpen(false);
    resetTourModal();
  };

  const openCreateTour = () => {
    resetTourModal();
    setTourModalOpen(true);
  };

  const openEditTour = (tour: TourType) => {
    setEditingTourId(tour.tourTypeId ?? null);
    setTourForm({ ...tour });
    setTourTypeImages(mapTourTypeImagesFromApi(tour.tourTypeImage));
    setTourModalOpen(true);
  };

  const handleSaveTourType = async () => {
    if (isSavingTourType) return;
    if (!tourForm.name?.trim()) {
      showToast('Tour type name is required');
      return;
    }
    const payload: TourType = {
      tourTypeId: editingTourId ?? undefined,
      name: tourForm.name.trim(),
      description: tourForm.description ?? '',
      location: tourForm.location ?? 'Rome',
      meetingPointName: tourForm.meetingPointName ?? tourForm.name.trim(),
      meetingPointAddress: tourForm.meetingPointAddress ?? '',
      basePrice: Number(tourForm.basePrice ?? 0),
      durationMinutes: Number(tourForm.durationMinutes ?? 120),
      isActive: tourForm.isActive !== false,
      ...(tourTypeImages.length > 0
        ? { tourTypeImage: buildTourTypeImagePayload(tourTypeImages) }
        : {}),
    };
    try {
      if (editingTourId != null) {
        await dispatch(updateTourType(payload)).unwrap();
        showToast('✓ Tour type updated');
      } else {
        await dispatch(createTourType(payload)).unwrap();
        showToast('✓ Tour type saved');
      }
      closeTourModal();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save tour type');
    }
  };

  const handleDeleteTour = async (id: number) => {
    try {
      await dispatch(deleteTourType(id)).unwrap();
      showToast('Tour type deleted');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete tour type');
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Tour Types</h2>
          <p className={styles.panelSub}>Types, meeting points, default rates</p>
        </div>
        <AppButton variant="secondary" onClick={openCreateTour}>
          + Add Tour Type
        </AppButton>
      </div>

      <AppCard>
        {tourTypes.map((tour) => (
          <SettingsRow
            key={tour.tourTypeId}
            icon="🏛️"
            title={tour.name ?? 'Unnamed'}
            sub={`€${(tour.basePrice ?? 0).toFixed(2)} · ${Math.round((tour.durationMinutes ?? 0) / 60)}h`}
            action={
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: tour.isActive !== false ? 'var(--g600)' : 'var(--text-muted)',
                    minWidth: 52,
                    textAlign: 'right',
                    opacity: tour.isActive !== false ? 1 : 0.65,
                  }}
                >
                  {tour.isActive !== false ? 'Active' : 'Inactive'}
                </span>
                <ToggleSwitch
                  checked={tour.isActive !== false}
                  onCheckedChange={(checked) => {
                    void dispatch(
                      updateTourType({
                        ...tour,
                        isActive: checked,
                      }),
                    );
                    showToast(checked ? 'Tour type activated' : 'Tour type deactivated');
                  }}
                  aria-label={`${tour.name ?? 'Tour type'} active status`}
                />
                <SettingsRowMenu
                  onEdit={() => openEditTour(tour)}
                  onDelete={() => {
                    if (tour.tourTypeId != null) void handleDeleteTour(tour.tourTypeId);
                  }}
                  deleteTitle={`Delete ${tour.name ?? 'tour type'}?`}
                  deleteContent="This tour type will be removed permanently."
                />
              </div>
            }
          />
        ))}
        {tourTypes.length === 0 && (
          <p className={styles.panelSub}>No tour types yet.</p>
        )}
      </AppCard>

      <Modal
        title={editingTourId != null ? 'Edit Tour Type' : 'Add Tour Type'}
        open={tourModalOpen}
        onCancel={closeTourModal}
        maskClosable={!isSavingTourType}
        closable={!isSavingTourType}
        footer={[
          <AppButton
            key="cancel"
            variant="secondary"
            onClick={closeTourModal}
            disabled={isSavingTourType}
          >
            Cancel
          </AppButton>,
          <AppButton
            key="save"
            onClick={() => void handleSaveTourType()}
            disabled={isSavingTourType}
          >
            {isSavingTourType ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Spin size="small" />
                Saving…
              </span>
            ) : (
              'Save'
            )}
          </AppButton>,
        ]}
        destroyOnClose
      >
        <FormGrid>
          <FormInput
            label="Name"
            value={tourForm.name ?? ''}
            disabled={isSavingTourType}
            onChange={(e) => setTourForm((f) => ({ ...f, name: e.target.value }))}
          />
          <FormInput
            label="Base Price (€)"
            type="number"
            value={tourForm.basePrice ?? 0}
            disabled={isSavingTourType}
            onChange={(e) => setTourForm((f) => ({ ...f, basePrice: Number(e.target.value) }))}
          />
          <FormInput
            label="Duration (minutes)"
            type="number"
            value={tourForm.durationMinutes ?? 120}
            disabled={isSavingTourType}
            onChange={(e) =>
              setTourForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))
            }
          />
          <FormInput
            label="Location"
            value={tourForm.location ?? ''}
            disabled={isSavingTourType}
            onChange={(e) => setTourForm((f) => ({ ...f, location: e.target.value }))}
          />
          <FormInput
            label="Meeting Point Name"
            value={tourForm.meetingPointName ?? ''}
            disabled={isSavingTourType}
            onChange={(e) => setTourForm((f) => ({ ...f, meetingPointName: e.target.value }))}
          />
          <FormInput
            label="Meeting Point Address"
            value={tourForm.meetingPointAddress ?? ''}
            disabled={isSavingTourType}
            onChange={(e) => setTourForm((f) => ({ ...f, meetingPointAddress: e.target.value }))}
          />
          <FormTextarea
            label="Description"
            value={tourForm.description ?? ''}
            disabled={isSavingTourType}
            onChange={(e) => setTourForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
          />
          <TourTypeImagePicker
            images={tourTypeImages}
            onChange={setTourTypeImages}
            disabled={isSavingTourType}
          />
        </FormGrid>
      </Modal>
    </div>
  );
}
