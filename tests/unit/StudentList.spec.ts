import { mount } from '@vue/test-utils';
import StudentList from '~/components/StudentList.vue';

describe('StudentList', () => {
  const baseStudents = [
    {
      id: 'student-1',
      name: 'Ariana Roy',
      studentCode: 'STU-001',
      className: '5',
      section: 'B',
      primaryTeacher: 'Mr. Rahman',
      updatedAt: '2025-11-16T10:00:00.000Z',
      photoUrl: null,
      accentColor: '#0ea5e9',
      initials: 'AR',
    },
    {
      id: 'student-2',
      name: 'Imran Sadik',
      studentCode: 'STU-002',
      className: '5',
      section: null,
      primaryTeacher: null,
      updatedAt: '2025-11-15T08:30:00.000Z',
      photoUrl: 'https://example.com/photo.jpg',
      accentColor: '#10b981',
      initials: 'IS',
    },
  ];

  const mountComponent = (overrideProps: Record<string, unknown> = {}) => {
    return mount(StudentList, {
      props: {
        students: baseStudents,
        total: baseStudents.length,
        page: 1,
        pageSize: 10,
        loading: false,
        actionLoading: false,
        ...overrideProps,
      },
    });
  };

  it('renders student rows and emits edit/delete events', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-11-17T12:00:00.000Z'));

    const wrapper = mountComponent();

    expect(wrapper.text()).toContain('Ariana Roy');
    expect(wrapper.text()).toContain('Class 5');
    expect(wrapper.text()).toContain('Section B');
    expect(wrapper.text()).toContain('Showing 1-2 of 2');

    const editButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Edit');
    const deleteButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Delete');

    expect(editButton).toBeDefined();
    expect(deleteButton).toBeDefined();

    await editButton!.trigger('click');
    await deleteButton!.trigger('click');

    expect(wrapper.emitted('edit-student')).toBeTruthy();
    expect(wrapper.emitted('delete-student')).toBeTruthy();
    expect(wrapper.emitted('edit-student')?.[0]?.[0]).toMatchObject({
      id: 'student-1',
    });
    expect(wrapper.emitted('delete-student')?.[0]?.[0]).toMatchObject({
      id: 'student-1',
    });
  });

  it('shows empty state when there are no students', () => {
    const wrapper = mountComponent({
      students: [],
      total: 0,
    });

    expect(wrapper.text()).toContain('No students found');
    expect(wrapper.text()).toContain('Waiting for records…');
  });

  it('emits change-page when pagination controls are used', async () => {
    const wrapper = mountComponent({
      total: 40,
      page: 2,
      pageSize: 10,
    });

    expect(wrapper.text()).toContain('Showing 11-20 of 40');

    const prevButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('← Prev'));
    const nextButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Next'));

    await prevButton!.trigger('click');
    await nextButton!.trigger('click');

    expect(wrapper.emitted('change-page')).toBeTruthy();
    const emittedPages = wrapper
      .emitted('change-page')!
      .map(([value]) => value);
    expect(emittedPages).toContain(1);
    expect(emittedPages).toContain(3);
  });
});
