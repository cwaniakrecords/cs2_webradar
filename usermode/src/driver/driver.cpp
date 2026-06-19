#include "pch.hpp"

c_usermode_driver::~c_usermode_driver()
{
	this->reset();
}

bool c_usermode_driver::initialize(uint32_t process_id, usermode_backend_t backend)
{
	this->reset();

	if (process_id == 0)
		return false;

	this->m_backend = backend;
	this->m_process_handle = OpenProcess(PROCESS_VM_READ | PROCESS_QUERY_INFORMATION, false, process_id);
	if (this->m_process_handle == nullptr)
		return false;

	if (this->m_backend == usermode_backend_t::ntdll)
	{
		const auto ntdll_module = GetModuleHandleW(L"ntdll.dll");
		if (ntdll_module == nullptr)
			return false;

		this->m_nt_read_virtual_memory = reinterpret_cast<nt_read_virtual_memory_t>(GetProcAddress(ntdll_module, "NtReadVirtualMemory"));
		if (this->m_nt_read_virtual_memory == nullptr)
		{
			this->reset();
			return false;
		}
	}

	return true;
}

bool c_usermode_driver::is_initialized() const
{
	return this->m_process_handle != nullptr;
}

bool c_usermode_driver::read_memory(uintptr_t address, void* buffer, size_t size) const
{
	if (!this->is_initialized() || buffer == nullptr || size == 0)
		return false;

	if (this->m_backend == usermode_backend_t::ntdll && this->m_nt_read_virtual_memory != nullptr)
	{
		ULONG bytes_read = 0;
		const auto status = this->m_nt_read_virtual_memory(this->m_process_handle, reinterpret_cast<PVOID>(address), buffer, static_cast<ULONG>(size), &bytes_read);
		return NT_SUCCESS(status) && bytes_read == size;
	}

	return ReadProcessMemory(this->m_process_handle, reinterpret_cast<LPCVOID>(address), buffer, size, nullptr) != FALSE;
}

void c_usermode_driver::reset()
{
	this->m_nt_read_virtual_memory = nullptr;

	if (this->m_process_handle != nullptr)
	{
		CloseHandle(this->m_process_handle);
		this->m_process_handle = nullptr;
	}
}
