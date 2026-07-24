import { apiClient } from '../client';
import type { BackendApiResponse, Staff, StaffImageFile, StaffRequest } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

function appendFile(formData: FormData, file: StaffImageFile) {
  const fileName = file.name || 'staff.jpg';
  const type = file.type || 'image/jpeg';
  formData.append('profilePhoto', {
    uri: file.uri,
    name: fileName,
    type,
  } as any);
}

export const staffService = {
  listByProperty: (propertyId: string) =>
    apiClient
      .get<BackendApiResponse<Staff[]>>(`/api/v1/properties/${propertyId}/staff`)
      .then(unwrap),

  getById: (propertyId: string, staffId: string) =>
    apiClient
      .get<BackendApiResponse<Staff>>(`/api/v1/properties/${propertyId}/staff/${staffId}`)
      .then(unwrap),

  create: (propertyId: string, staff: StaffRequest, profilePhoto?: StaffImageFile) => {
    const formData = new FormData();
    formData.append('staff', JSON.stringify(staff));
    if (profilePhoto) appendFile(formData, profilePhoto);
    return apiClient
      .post<BackendApiResponse<Staff>>(`/api/v1/properties/${propertyId}/staff`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrap);
  },

  update: (
    propertyId: string,
    staffId: string,
    staff: Partial<StaffRequest>,
    profilePhoto?: StaffImageFile
  ) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(staff));
    if (profilePhoto) appendFile(formData, profilePhoto);
    return apiClient
      .put<BackendApiResponse<Staff>>(`/api/v1/properties/${propertyId}/staff/${staffId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrap);
  },

  delete: (propertyId: string, staffId: string) =>
    apiClient.delete(`/api/v1/properties/${propertyId}/staff/${staffId}`),
};
