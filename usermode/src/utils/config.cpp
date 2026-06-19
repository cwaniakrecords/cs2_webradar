#include "pch.hpp"

bool cfg::setup(config_data_t& config_data)
{
#ifdef WEBRADAR_PRIVACY_BUILD
	config_data.m_use_usermode_driver = true;
#else
	config_data.m_use_usermode_driver = false;
#endif

	std::ifstream file("config.json");
	if (!file.is_open())
	{
		LOG_WARNING("cannot open file 'config.json'");

		std::ofstream example_config("config.json");
		example_config << std::format(R"({{
    "m_ip": "localhost",
    "m_use_usermode_driver": {}
}})", config_data.m_use_usermode_driver ? "true" : "false");

		return {};
	}

	const auto parsed_data = nlohmann::json::parse(file);
	if (parsed_data.empty())
	{
		LOG_ERROR("failed to parse 'config.json'");
		return {};
	}

	try
	{
		config_data.m_ip = parsed_data.at("m_ip").get<std::string>();

		if (parsed_data.contains("m_use_usermode_driver"))
			config_data.m_use_usermode_driver = parsed_data.at("m_use_usermode_driver").get<bool>();
	}
	catch (const std::exception& e)
	{
		LOG_ERROR("failed to deserialize 'config_data_t' (%s)", e.what());
		return {};
	}

	return true;
}