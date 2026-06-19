#pragma once

enum class usermode_backend_t
{
	winapi = 0,
	ntdll
};

class c_usermode_driver
{
public:
	~c_usermode_driver();

	bool initialize(uint32_t process_id, usermode_backend_t backend);
	bool is_initialized() const;
	bool read_memory(uintptr_t address, void* buffer, size_t size) const;
	void reset();

private:
	using nt_read_virtual_memory_t = NTSTATUS(NTAPI*)(HANDLE, PVOID, PVOID, ULONG, PULONG);

	HANDLE m_process_handle = nullptr;
	usermode_backend_t m_backend = usermode_backend_t::winapi;
	nt_read_virtual_memory_t m_nt_read_virtual_memory = nullptr;
};
