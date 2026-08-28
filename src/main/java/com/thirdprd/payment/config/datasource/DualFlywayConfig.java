package com.thirdprd.payment.config.datasource;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
@ConditionalOnProperty(name = "spring.flyway.enabled", havingValue = "true", matchIfMissing = true)
public class DualFlywayConfig {

    @Bean(initMethod = "migrate")
    public Flyway postgresFlyway(@Qualifier("postgresDataSource") DataSource dataSource) {
        return Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration/postgres")
                .baselineOnMigrate(true)
                .table("flyway_schema_history")
                .load();
    }

    @Bean(initMethod = "migrate")
    public Flyway mysqlFlyway(@Qualifier("mysqlDataSource") DataSource dataSource) {
        return Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration/mysql")
                .baselineOnMigrate(true)
                .table("flyway_schema_history")
                .load();
    }
}
