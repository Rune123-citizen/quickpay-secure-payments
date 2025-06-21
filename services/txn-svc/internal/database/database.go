
package database

import (
	"github.com/payflow/txn-svc/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Initialize(databaseURL string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}

	// Auto migrate
	err = db.AutoMigrate(&models.Transaction{})
	if err != nil {
		return nil, err
	}

	return db, nil
}
