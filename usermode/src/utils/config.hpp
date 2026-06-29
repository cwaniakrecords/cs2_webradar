#pragma once

struct config_data_t
{
	std::string m_ip = "localhost";
	bool m_use_usermode_driver = false;
};

namespace cfg
{
	bool setup(config_data_t& config_data);
}